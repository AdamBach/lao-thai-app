#!/usr/bin/env node
import "dotenv/config";
import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { beginnerLessons, lessonAudio } from "../drizzle/schema.ts";
import { eq, and } from "drizzle-orm";

function createS3Client() {
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
  const region = process.env.S3_REGION ?? "auto";
  const endpoint = process.env.S3_ENDPOINT;
  if (!accessKeyId || !secretAccessKey) throw new Error("Missing S3 credentials in .env");
  return new S3Client({ region, ...(endpoint ? { endpoint } : {}), credentials: { accessKeyId, secretAccessKey }, forcePathStyle: false });
}

async function uploadToStorage(s3, key, buffer) {
  const bucket = process.env.S3_BUCKET;
  if (!bucket) throw new Error("Missing S3_BUCKET in .env");
  await s3.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: buffer, ContentType: "audio/mpeg", ACL: "public-read" }));
  const publicUrl = process.env.S3_PUBLIC_URL;
  if (publicUrl) return `${publicUrl.replace(/\/+$/, "")}/${key}`;
  return `https://${bucket}.s3.${process.env.S3_REGION ?? "us-east-1"}.amazonaws.com/${key}`;
}

async function googleTranslateTTS(text, langCode) {
  try {
    const params = new URLSearchParams({ ie: "UTF-8", q: text, tl: langCode, client: "gtx", ttsspeed: "0.8" });
    const response = await fetch(`https://translate.google.com/translate_tts?${params.toString()}`, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36", Referer: "https://translate.google.com/" }
    });
    if (!response.ok) { console.warn(`  [TTS] Google failed: ${response.status}`); return null; }
    const buf = Buffer.from(await response.arrayBuffer());
    if (buf.byteLength < 100) { console.warn("  [TTS] Too small"); return null; }
    return buf;
  } catch (err) { console.warn("  [TTS] Google error:", err.message); return null; }
}

async function azureTTS(text, langCode) {
  const apiKey = process.env.AZURE_TTS_KEY;
  if (!apiKey) return null;
  const region = process.env.AZURE_TTS_REGION ?? "southeastasia";
  const voices = { th: "th-TH-AcharaNeural", lo: "lo-LA-KeomanyNeural" };
  const voiceName = voices[langCode];
  if (!voiceName) return null;
  const escapeXml = (t) => t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  const ssml = `<speak version='1.0' xml:lang='${langCode}'><voice name='${voiceName}'><prosody rate='0.9'>${escapeXml(text)}</prosody></voice></speak>`;
  try {
    const response = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: "POST",
      headers: { "Ocp-Apim-Subscription-Key": apiKey, "Content-Type": "application/ssml+xml", "X-Microsoft-OutputFormat": "audio-16khz-32kbitrate-mono-mp3" },
      body: ssml
    });
    if (!response.ok) return null;
    const buf = Buffer.from(await response.arrayBuffer());
    return buf.byteLength > 0 ? buf : null;
  } catch (err) { return null; }
}

async function generateAudio(text, language) {
  const codes = { thai: "th", lao: "lo" };
  const langCode = codes[language];
  if (!langCode) return null;
  if (process.env.AZURE_TTS_KEY) {
    const buf = await azureTTS(text, langCode);
    if (buf) return buf;
  }
  return await googleTranslateTTS(text, langCode);
}

function getSpeakableText(item, language) {
  if (language === "thai") return item.thai || item.phrase || item.time || item.month || item.day || String(item.number ?? "");
  return item.lao || item.phrase || item.time || item.month || item.day || String(item.number ?? "");
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function generateAllAudio() {
  console.log("\n Lao-Thai Learning App — Batch TTS Audio Generator\n");
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  const db = drizzle(connection);
  const s3 = createS3Client();
  let generated = 0, skipped = 0, failed = 0;
  try {
    const lessons = await db.select().from(beginnerLessons);
    console.log(`Found ${lessons.length} lessons\n`);
    for (const lesson of lessons) {
      console.log(`▶ [${lesson.language.toUpperCase()}] ${lesson.title}`);
      let items;
      try { items = JSON.parse(lesson.content); } catch { console.error("  ✗ Could not parse content"); failed++; continue; }
      for (let idx = 0; idx < items.length; idx++) {
        const text = getSpeakableText(items[idx], lesson.language);
        if (!text) { skipped++; continue; }
        const existing = await db.select().from(lessonAudio).where(and(eq(lessonAudio.lessonId, lesson.id), eq(lessonAudio.itemIndex, idx))).limit(1);
        if (existing.length > 0 && existing[0].audioUrl) { console.log(`  ✓ Item ${idx} "${text}": cached`); skipped++; continue; }
        console.log(`  ⟳ Item ${idx} "${text}"...`);
        const audioBuffer = await generateAudio(text, lesson.language);
        if (!audioBuffer) { console.error(`  ✗ Item ${idx}: all TTS failed`); failed++; continue; }
        const fileKey = `audio/lessons/${lesson.id}/item-${idx}-${Date.now()}.mp3`;
        const audioUrl = await uploadToStorage(s3, fileKey, audioBuffer);
        await db.insert(lessonAudio).values({ lessonId: lesson.id, itemIndex: idx, text, language: lesson.language, audioUrl });
        console.log(`  ✓ Item ${idx}: ${audioUrl}`);
        generated++;
        await sleep(600);
      }
    }
  } finally {
    console.log(`\n Generated: ${generated} | Skipped: ${skipped} | Failed: ${failed}`);
    await connection.end();
  }
  process.exit(failed > 0 ? 1 : 0);
}

generateAllAudio().catch((err) => { console.error("[Fatal]", err); process.exit(1); });