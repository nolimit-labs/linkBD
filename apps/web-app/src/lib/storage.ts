// Generate a download URL for a storage key
export async function generateDownloadURL(key: string | null | undefined): Promise<string | null> {
  if (!key) return null;
  
  // Construct the public URL for the file
  // This assumes your backend serves files from /api/storage/download/:key
  return `/api/storage/download/${encodeURIComponent(key)}`;
}