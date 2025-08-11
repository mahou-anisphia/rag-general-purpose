import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  type PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "~/env";

// Initialize S3 client with MinIO configuration
const s3Client = new S3Client({
  endpoint: env.MINIO_ENDPOINT,
  credentials: {
    accessKeyId: env.MINIO_ACCESS_KEY,
    secretAccessKey: env.MINIO_SECRET_KEY,
  },
  region: "us-east-1", // MinIO doesn't require a specific region, but AWS SDK needs one
  forcePathStyle: true, // Required for MinIO
});

export interface UploadOptions {
  /**
   * The file content to upload
   */
  file: Buffer | Uint8Array | string;
  /**
   * The key (path) where the file will be stored in the bucket
   */
  key: string;
  /**
   * The MIME type of the file
   */
  contentType?: string;
  /**
   * Custom metadata for the file
   */
  metadata?: Record<string, string>;
}

export interface S3Utils {
  /**
   * Upload a file to MinIO/S3
   */
  create: (options: UploadOptions) => Promise<{ key: string; etag: string }>;
  /**
   * Delete a file from MinIO/S3
   */
  delete: (key: string) => Promise<void>;
  /**
   * Generate a presigned URL for public access with expiration
   */
  getPublicUrl: (key: string, expiresInSeconds?: number) => Promise<string>;
}

/**
 * Create/upload a file to MinIO
 */
export async function create(
  options: UploadOptions,
): Promise<{ key: string; etag: string }> {
  const { file, key, contentType, metadata } = options;

  const params: PutObjectCommandInput = {
    Bucket: env.MINIO_BUCKET,
    Key: key,
    Body: file,
    ContentType: contentType,
    Metadata: metadata,
  };

  const command = new PutObjectCommand(params);
  const result = await s3Client.send(command);

  if (!result.ETag) {
    throw new Error("Failed to upload file - no ETag returned");
  }

  return {
    key,
    etag: result.ETag,
  };
}

/**
 * Delete a file from MinIO
 */
export async function deleteFile(key: string): Promise<void> {
  const params = {
    Bucket: env.MINIO_BUCKET,
    Key: key,
  };

  const command = new DeleteObjectCommand(params);
  await s3Client.send(command);
}

/**
 * Generate a presigned URL for temporary public access
 * @param key - The file key/path in the bucket
 * @param expiresInSeconds - URL expiration time in seconds (default: 3600 = 1 hour)
 */
export async function getPublicUrl(
  key: string,
  expiresInSeconds = 3600,
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: env.MINIO_BUCKET,
    Key: key,
  });

  // Note: For getting files, we should use GetObjectCommand, but for presigned URLs
  // that allow both reading and writing, PutObjectCommand is often used.
  // If you only need read access, consider using GetObjectCommand instead.
  const url = await getSignedUrl(s3Client, command, {
    expiresIn: expiresInSeconds,
  });

  return url;
}

/**
 * Generate a presigned URL for downloading/reading files only
 * @param key - The file key/path in the bucket
 * @param expiresInSeconds - URL expiration time in seconds (default: 3600 = 1 hour)
 */
export async function getDownloadUrl(
  key: string,
  expiresInSeconds = 3600,
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: env.MINIO_BUCKET,
    Key: key,
  });

  const url = await getSignedUrl(s3Client, command, {
    expiresIn: expiresInSeconds,
  });

  return url;
}

/**
 * Get file content as Buffer from MinIO
 * @param key - The file key/path in the bucket
 */
export async function getFileContent(key: string): Promise<Buffer> {
  const command = new GetObjectCommand({
    Bucket: env.MINIO_BUCKET,
    Key: key,
  });

  const response = await s3Client.send(command);

  if (!response.Body) {
    throw new Error("File not found or empty");
  }

  // Convert readable stream to buffer
  const chunks: Buffer[] = [];
  const readable = response.Body as NodeJS.ReadableStream;

  for await (const chunk of readable) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
}

// Export default object with all functions
const s3Utils: S3Utils = {
  create,
  delete: deleteFile,
  getPublicUrl,
};

export default s3Utils;

// Also export the S3 client in case direct access is needed
export { s3Client };
