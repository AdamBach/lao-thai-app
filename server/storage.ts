@'
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

let _client = null;

function getS3Client() {
  if (_client) return _client;
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
  const region = process.env.S3_REGION ?? "auto";
  const endpoint = process.env.S3_ENDPOINT;
  if (!accessKeyId || !secretAccessKey) throw new Error("Missing S3 credentials in .env");
  _client = new S3Client({ region, ...(endpoint ? { endpoint } : {}), credentials: { accessKeyId, secretAccessKey }, forcePathStyle: !!endpoint });
  return _client;
}

function getBucket() {
  const bucket = process.env.S3_BUCKET;
  if (!bucket) throw new Error("Missing S3_BUCKET in .env");
  return bucket;
}

function buildPublicUrl(key) {
  const publicUrl = process.env.S3_PUBLIC_URL;
  if (publicUrl) return `${publicUrl.replace(/\/+$/, "")}/${key}`;
  return `https://${getBucket()}.s3.${process.env.S3_REGION ?? "us-east-1"}.amazonaws.com/${key}`;
}

export async function storagePut(relKey, data, contentType = "application/octet-stream") {
  const client = getS3Client();
  const key = relKey.replace(/^\/+/, "");
  const body = typeof data === "string" ? Buffer.from(data) : data;
  await client.send(new PutObjectCommand({ Bucket: getBucket(), Key: key, Body: body, ContentType: contentType, ACL: "public-read" }));
  const url = buildPublicUrl(key);
  console.log(`[Storage] Uploaded: ${key} -> ${url}`);
  return { key, url };
}

export async function storageGet(relKey) {
  const client = getS3Client();
  const key = relKey.replace(/^\/+/, "");
  const command = new GetObjectCommand({ Bucket: getBucket(), Key: key });
  const url = await getSignedUrl(client, command, { expiresIn: 3600 });
  return { key, url };
}

export async function storageDelete(relKey) {
  const client = getS3Client();
  const key = relKey.replace(/^\/+/, "");
  await client.send(new DeleteObjectCommand({ Bucket: getBucket(), Key: key }));
  console.log(`[Storage] Deleted: ${key}`);
}
'@ | Set-Content -Path "D:\lao_thai_learning_app_complete\lao_thai_learning_app\server\storage.ts" -Encoding UTF8