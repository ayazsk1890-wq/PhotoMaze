/**
 * capacitorBridge.ts
 * PhotoMaze — Native Capacitor bridge for Android/iOS.
 *
 * Detects whether we are running inside a Capacitor native shell and exposes
 * safe wrappers around Camera, Filesystem and Share plugins.  Falls back to
 * standard browser APIs when running in a regular web browser so the same
 * codebase works unchanged on desktop / mobile web.
 */

// ─── Type guard ─────────────────────────────────────────────────────────────

/** Returns true when the app is running inside a native Capacitor shell. */
export function isNative(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } })
    .Capacitor?.isNativePlatform?.();
}

/** Returns true when running on Android (native). */
export function isAndroid(): boolean {
  if (typeof window === 'undefined') return false;
  const cap = (window as unknown as { Capacitor?: { getPlatform?: () => string } }).Capacitor;
  return cap?.getPlatform?.() === 'android';
}

// ─── Camera ─────────────────────────────────────────────────────────────────

export interface CapturedPhoto {
  /** base64-encoded image data (without the data-URI prefix). */
  base64: string;
  /** e.g. "jpeg" */
  format: string;
  /** data-URI suitable for use in <img src=…> */
  dataUrl: string;
}

/**
 * Opens the native camera (or photo library) and returns the selected image
 * as a base64-encoded data-URI.  When not running natively this throws so
 * callers can fall back to a browser <input type="file"> element.
 */
export async function capturePhotoNative(
  source: 'camera' | 'photos' = 'camera',
): Promise<CapturedPhoto> {
  if (!isNative()) {
    throw new Error('capturePhotoNative: not running in Capacitor native shell');
  }

  // Dynamic import so the Camera package is tree-shaken on web-only builds.
  const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');

  const photo = await Camera.getPhoto({
    quality: 95,
    allowEditing: false,
    resultType: CameraResultType.Base64,
    source: source === 'camera' ? CameraSource.Camera : CameraSource.Photos,
    saveToGallery: false,
    width: 2048,
    height: 2048,
    correctOrientation: true,
  });

  const base64 = photo.base64String ?? '';
  const format = photo.format ?? 'jpeg';
  const dataUrl = `data:image/${format};base64,${base64}`;

  return { base64, format, dataUrl };
}

// ─── File / Download ─────────────────────────────────────────────────────────

/**
 * Saves a blob/file to the device's public Downloads folder (Android) and
 * then opens the Android share sheet so the user can also share it.
 *
 * Falls back to a standard browser `<a download>` click on web.
 */
export async function saveAndShareFile(
  fileName: string,
  blob: Blob,
  mimeType: string,
): Promise<void> {
  if (!isNative()) {
    // Standard browser download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }

  const { Filesystem, Directory } = await import('@capacitor/filesystem');
  const { Share } = await import('@capacitor/share');

  // Convert blob → base64
  const base64 = await blobToBase64(blob);

  // Write to Documents directory
  const writeResult = await Filesystem.writeFile({
    path: `PhotoMaze/${fileName}`,
    data: base64,
    directory: Directory.Documents,
    recursive: true,
  });

  // Share / open the saved file
  await Share.share({
    title: `PhotoMaze — ${fileName}`,
    url: writeResult.uri,
    dialogTitle: 'Save or share your photo',
  });
}

/** Converts a Blob to a base64 string (without the data-URI prefix). */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Strip "data:<mime>;base64," prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// ─── Back button (Android) ───────────────────────────────────────────────────

/**
 * Registers a handler for the Android hardware back button.
 * Returns an unsubscribe function.  No-op on web.
 */
export async function registerBackButtonHandler(
  handler: () => void,
): Promise<() => void> {
  if (!isNative()) return () => {};

  const { App } = await import('@capacitor/app');
  const listener = await App.addListener('backButton', handler);
  return () => listener.remove();
}

// ─── App lifecycle ───────────────────────────────────────────────────────────

/** Minimises the app to the background (Android). No-op on web. */
export async function minimiseApp(): Promise<void> {
  if (!isAndroid()) return;
  const { App } = await import('@capacitor/app');
  await App.minimizeApp();
}

