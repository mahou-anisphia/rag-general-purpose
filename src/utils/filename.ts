/**
 * Utility functions for handling filenames
 */

/**
 * Truncates a filename if it's longer than the specified length
 * Keeps the file extension intact when possible
 */
export function truncateFilename(filename: string, maxLength = 30): string {
  if (filename.length <= maxLength) {
    return filename;
  }

  // Find the last dot to identify the extension
  const lastDotIndex = filename.lastIndexOf(".");

  if (lastDotIndex === -1 || lastDotIndex === 0) {
    // No extension or filename starts with dot, simple truncation
    return filename.substring(0, maxLength - 3) + "...";
  }

  const extension = filename.substring(lastDotIndex);
  const nameWithoutExtension = filename.substring(0, lastDotIndex);

  // If extension is too long, just truncate the whole filename
  if (extension.length > maxLength / 2) {
    return filename.substring(0, maxLength - 3) + "...";
  }

  const availableLength = maxLength - extension.length - 3; // 3 for "..."

  if (availableLength <= 0) {
    return filename.substring(0, maxLength - 3) + "...";
  }

  return nameWithoutExtension.substring(0, availableLength) + "..." + extension;
}

/**
 * Gets a display name for a filename, ensuring it fits within UI constraints
 */
export function getDisplayFilename(
  filename: string,
  maxLength?: number,
): string {
  return truncateFilename(filename, maxLength);
}

/**
 * Extracts just the filename from a full path
 */
export function getFilenameFromPath(filePath: string): string {
  return filePath.split(/[/\\]/).pop() ?? filePath;
}
