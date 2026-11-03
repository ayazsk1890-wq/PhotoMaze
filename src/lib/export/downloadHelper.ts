/**
 * Cross-Platform File Download & Native Share Helper
 *
 * Provides bulletproof file downloading across:
 * - Desktop (Chrome, Edge, Firefox, Safari macOS)
 * - Mobile iOS (Safari, Chrome iOS) with Web Share API Level 2 and fallback
 * - Mobile Android (Chrome, Firefox Android, Samsung Internet)
 */

export interface DownloadOptions {
  preferShareOnMobile?: boolean;
  mimeType?: string;
}

/**
 * Detects whether the current browser is running on iOS (iPhone/iPad/iPod).
 */
export function isIOS(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

/**
 * Detects whether the device is a mobile or tablet viewport/platform.
 */
export function isMobileDevice(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;
  return isIOS() || /Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Downloads a Blob directly to the client's device or triggers the native Share Sheet on mobile.
 */
export async function downloadBlob(
  blob: Blob,
  filename: string,
  options: DownloadOptions = {}
): Promise<boolean> {
  const { preferShareOnMobile = true } = options;

  // On modern mobile devices (iOS 15+, Android Chrome), the Web Share API provides
  // the cleanest user experience (saving directly to Camera Roll or Files)
  if (preferShareOnMobile && isMobileDevice() && typeof navigator !== "undefined" && navigator.share) {
    try {
      const file = new File([blob], filename, { type: blob.type || "application/octet-stream" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: filename,
        });
        return true;
      }
    } catch (shareErr) {
      // User cancelled share or aborted; fall through to standard anchor download
      if ((shareErr as Error).name === "AbortError") {
        return true;
      }
      console.warn("Native share failed, falling back to anchor download:", shareErr);
    }
  }

  // Universal Blob Object URL download via simulated anchor click
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.style.display = "none";
  link.href = blobUrl;
  link.download = filename;
  link.rel = "noopener";

  document.body.appendChild(link);
  try {
    link.click();
  } catch (clickErr) {
    console.error("Link click failed:", clickErr);
    // Safari fallback: open in new tab so user can long-press to save
    window.open(blobUrl, "_blank");
  } finally {
    // Delay revocation to ensure browser has completed the file read
    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      URL.revokeObjectURL(blobUrl);
    }, 60000);
  }

  return true;
}

/**
 * Downloads a binary Uint8Array as a file with the given MIME type.
 */
export async function downloadUint8Array(
  bytes: Uint8Array,
  filename: string,
  mimeType: string,
  options?: DownloadOptions
): Promise<boolean> {
  const blob = new Blob([bytes as unknown as BlobPart], { type: mimeType });
  return downloadBlob(blob, filename, options);
}

/**
 * Downloads a base64 Data URL as a file.
 */
export async function downloadDataUrl(
  dataUrl: string,
  filename: string,
  options?: DownloadOptions
): Promise<boolean> {
  const commaIdx = dataUrl.indexOf(",");
  const header = commaIdx >= 0 ? dataUrl.slice(0, commaIdx) : "";
  const base64 = commaIdx >= 0 ? dataUrl.slice(commaIdx + 1) : dataUrl;

  const mimeMatch = header.match(/data:([^;]+)/);
  const mimeType = mimeMatch ? mimeMatch[1] : "application/octet-stream";

  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return downloadUint8Array(bytes, filename, mimeType, options);
}

