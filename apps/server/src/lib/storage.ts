import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from 'dotenv'

dotenv.config()

const BUCKET_NAME = process.env.R2_BUCKET_NAME!;
if (!BUCKET_NAME) {
  throw new Error('R2_BUCKET_NAME is not set');
}

export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://5358e298d401acdae9065a383b459384.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

// =====================================================================
// Storage Helper Functions
// =====================================================================

// Helper function for generating storage paths
export function generateStoragePath(userId: string, organizationId: string | null | undefined, filename: string): string {
  const timestamp = Date.now();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  const uniqueFilename = `${timestamp}-${sanitizedFilename}`;

  if (organizationId) {
    return `uploads/orgs/${organizationId}/${uniqueFilename}`;
  }
  return `uploads/users/${userId}/${uniqueFilename}`;
}

// Generate a presigned download URL for any file key from R2
export async function generateDownloadURL(fileKey: string | null, expiresIn: number = 3600): Promise<string | null> {
  if (!fileKey) return null;
  
  try {
    const presignedUrl = await getSignedUrl(r2, new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
    }), { expiresIn });

    return presignedUrl;
  } catch (error) {
    console.error('Failed to generate download URL:', error);
    return null;
  }
}

export async function generateUploadURL(fileKey: string | null, fileType: string, fileSize: number, userId: string, organizationId: string | null | undefined, fileName: string, expiresIn: number = 3600): Promise<string | null> {
  if (!fileKey) return null;
  
  try {
    const presignedUrl = await getSignedUrl(r2, new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
      ContentType: fileType,
      ContentLength: fileSize,
      Metadata: {
        userId,
        organizationId: organizationId || '',
        originalName: fileName,
      }
    }), { expiresIn });

    return presignedUrl;
  } catch (error) {
    console.error('Failed to generate upload URL:', error);
    return null;
  }
}

export async function deleteFile(fileKey: string) {
  await r2.send(new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileKey,
  }));
}