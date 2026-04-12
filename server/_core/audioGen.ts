import type { Express, Request, Response } from "express";
import mysql from "mysql2/promise";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Simple secret to prevent random people from triggering this
const ADMIN_SECRET = process.env.AUDIO_GEN_SECRET ?? "generate-audio-now";

function createS3Client() {
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
  const region = process.env.S3_REGION ?? "auto";
  const endpoint = process.env.S3_ENDPOINT;
  if (!accessKeyId || !secretAccessKey) throw new Error("Missing S3 credentials");
  return new S3Client({
    region,
    ...(endpoint ? { endpoint } : {}),
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: false,
  });
}

async function uploadToStorage(s3: S3Client, key: string, buffer: Buffer): Promise<string> {
  const bucket = process.env.S3_BUCKET;
  if (!bucket) throw new Error("Missing S3_BUCKET");
  await s3.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: buffer, ContentType: "audio/mpeg", ACL: "public-read" }));
  const publicUrl = process.env.S3_PUBLIC_URL;
  if (publicUrl) return `${publicUrl.replace(/\/+$/, "")}/${key}`;
  return `https://${bucket}.s3.${process.env.S3_REGION ?? "us-east-1"}.amazonaws.com/${key}`;
}

async function googleTranslateTTS(text: string, langCode: string): Promise<Buffer | null> {
  try {
    const params = new URLSearchParams({ ie: "UTF-8", q: text, tl: langCode, client: "gtx", ttsspeed: "0.8" });
    const response = await fetch(`https://translate.google.com/translate_tts?${params.toString()}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        Referer: "https://translate.google.com/",
      },
    });
    if (!response.ok) return null;
    const buf = Buffer.from(await response.arrayBuffer());
    return buf.byteLength > 100 ? buf : null;
  } catch { return null; }
}

async function azureTTS(text: string, langCode: string): Promise<Buffer | null> {
  const apiKey = process.env.AZURE_TTS_KEY;
  if (!apiKey) return null;
  const region = process.env.AZURE_TTS_REGION ?? "southeastasia";
  const voices: Record<string, string> = { th: "th-TH-AcharaNeural", lo: "lo-LA-KeomanyNeural" };
  const voiceName = voices[langCode];
  if (!voiceName) return null;
  const escapeXml = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const ssml = `<speak version='1.0' xml:lang='${langCode}'><voice name='${voiceName}'><prosody rate='0.9'>${escapeXml(text)}</prosody></voice></speak>`;
  try {
    const response = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": apiKey,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "audio-16khz-32kbitrate-mono-mp3",
      },
      body: ssml,
    });
    if (!response.ok) return null;
    const buf = Buffer.from(await response.arrayBuffer());
    return buf.byteLength > 0 ? buf : null;
  } catch { return null; }
}

function getSpeakableText(item: any, language: string): string {
  if (language === "thai") return item.thai || item.phrase || item.time || item.month || item.day || String(item.number ?? "");
  return item.lao || item.phrase || item.time || item.month || item.day || String(item.number ?? "");
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export function registerAudioGenRoute(app: Express) {
  app.post("/api/admin/generate-audio", async (req: Request, res: Response) => {
    const secret = req.headers["x-admin-secret"] ?? req.query.secret;
    if (secret !== ADMIN_SECRET) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    // Stream progress back as newline-delimited JSON
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");
    res.flushHeaders();

    const log = (msg: string) => {
      console.log(msg);
      res.write(msg + "\n");
    };

    let generated = 0, skipped = 0, failed = 0;
    let connection: mysql.Connection | null = null;

    try {
      connection = await mysql.createConnection(process.env.DATABASE_URL!);
      const s3 = createS3Client();

      log("🎵 Starting audio generation...\n");

      const [lessons] = await connection.execute("SELECT id, language, title, content FROM beginner_lessons") as any;
      log(`Found ${lessons.length} lessons\n`);

      for (const lesson of lessons) {
        log(`▶ [${lesson.language.toUpperCase()}] ${lesson.title}`);

        let items: any[];
        try { items = JSON.parse(lesson.content); }
        catch { log("  ✗ Could not parse content"); failed++; continue; }

        for (let idx = 0; idx < items.length; idx++) {
          const text = getSpeakableText(items[idx], lesson.language);
          if (!text) { skipped++; continue; }

          const [existing] = await connection.execute(
            "SELECT id FROM lesson_audio WHERE lessonId = ? AND itemIndex = ? LIMIT 1",
            [lesson.id, idx]
          ) as any;

          if (existing.length > 0) {
            log(`  ✓ Item ${idx} "${text}": cached`);
            skipped++;
            continue;
          }

          log(`  ⟳ Item ${idx} "${text}"...`);

          let audioBuffer: Buffer | null = null;
          if (process.env.AZURE_TTS_KEY) {
            audioBuffer = await azureTTS(text, lesson.language === "thai" ? "th" : "lo");
          }
          if (!audioBuffer) {
            audioBuffer = await googleTranslateTTS(text, lesson.language === "thai" ? "th" : "lo");
          }

          if (!audioBuffer) {
            log(`  ✗ Item ${idx}: all TTS providers failed`);
            failed++;
            continue;
          }

          const fileKey = `audio/lessons/${lesson.id}/item-${idx}-${Date.now()}.mp3`;
          const audioUrl = await uploadToStorage(s3, fileKey, audioBuffer);

          await connection.execute(
            "INSERT INTO lesson_audio (lessonId, itemIndex, text, language, audioUrl) VALUES (?, ?, ?, ?, ?)",
            [lesson.id, idx, text, lesson.language, audioUrl]
          );

          log(`  ✓ Item ${idx}: uploaded`);
          generated++;
          await sleep(600);
        }
      }

      log(`\n✅ Done! Generated: ${generated} | Cached: ${skipped} | Failed: ${failed}`);
    } catch (err: any) {
      log(`\n❌ Fatal error: ${err.message}`);
    } finally {
      if (connection) await connection.end();
      res.end();
    }
  });
}
