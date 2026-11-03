/**
 * Hardware Acceleration & Device Capabilities Detection
 *
 * Implements strict hardware priority:
 * 1. WebGPU (Fastest, zero CPU overhead, GPU tensor shaders)
 * 2. WASM with SIMD (High-efficiency client-side fallback)
 * 3. CPU (Zero-network fallback for legacy/restricted environments)
 */

export type ExecutionProvider = 'webgpu' | 'wasm' | 'cpu';

export interface DeviceCapabilities {
  hasWebGPU: boolean;
  hasWasm: boolean;
  hasSimd: boolean;
  deviceMemoryGb: number;
  hardwareConcurrency: number;
  isMobileDevice: boolean;
  provider: ExecutionProvider;
  recommendedProcessingMaxDimension: number;
}

let cachedCapabilities: DeviceCapabilities | null = null;

/**
 * Detects WebAssembly SIMD support via a minimal 16-byte vector probe
 */
function detectWasmSimd(): boolean {
  try {
    if (typeof WebAssembly !== 'object' || typeof WebAssembly.validate !== 'function') {
      return false;
    }
    // Minimal valid WebAssembly binary with i32x4 SIMD instruction
    const simdBinary = new Uint8Array([
      0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00,
      0x01, 0x05, 0x01, 0x60, 0x00, 0x01, 0x7b,
      0x03, 0x02, 0x01, 0x00,
      0x0a, 0x0a, 0x01, 0x08, 0x00, 0xfd, 0x0c, 0x00, 0x00, 0x00, 0x00, 0x0b
    ]);
    return WebAssembly.validate(simdBinary);
  } catch {
    return false;
  }
}

/**
 * Returns comprehensive device and hardware acceleration capabilities.
 * Results are cached in-memory after first resolution.
 */
export async function getHardwareCapabilities(): Promise<DeviceCapabilities> {
  if (cachedCapabilities) return cachedCapabilities;

  const isBrowser = typeof window !== 'undefined' && typeof navigator !== 'undefined';
  if (!isBrowser) {
    return {
      hasWebGPU: false,
      hasWasm: true,
      hasSimd: false,
      deviceMemoryGb: 8,
      hardwareConcurrency: 4,
      isMobileDevice: false,
      provider: 'wasm',
      recommendedProcessingMaxDimension: 1200,
    };
  }

  // 1. Detect WebGPU
  let hasWebGPU = false;
  if ('gpu' in navigator && typeof (navigator as any).gpu?.requestAdapter === 'function') {
    try {
      const adapter = await (navigator as any).gpu.requestAdapter();
      hasWebGPU = !!adapter;
    } catch {
      hasWebGPU = false;
    }
  }

  // 2. Detect WASM & SIMD
  const hasWasm = typeof WebAssembly === 'object' && typeof WebAssembly.instantiate === 'function';
  const hasSimd = hasWasm && detectWasmSimd();

  // 3. Detect device memory & concurrency
  const nav = navigator as any;
  const deviceMemoryGb = nav.deviceMemory || 4;
  const hardwareConcurrency = nav.hardwareConcurrency || 4;

  // 4. Detect mobile / WebView
  const userAgent = nav.userAgent || '';
  const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

  // 5. Select execution provider: WebGPU -> WASM -> CPU
  let provider: ExecutionProvider = 'cpu';
  if (hasWebGPU) {
    provider = 'webgpu';
  } else if (hasWasm) {
    provider = 'wasm';
  }

  // 6. Balanced working preview resolution:
  // Low-memory Android / mobile: 960px max dimension
  // Desktop / high-memory: 1200px max dimension
  const recommendedProcessingMaxDimension =
    isMobileDevice || deviceMemoryGb <= 3 ? 960 : 1200;

  cachedCapabilities = {
    hasWebGPU,
    hasWasm,
    hasSimd,
    deviceMemoryGb,
    hardwareConcurrency,
    isMobileDevice,
    provider,
    recommendedProcessingMaxDimension,
  };

  return cachedCapabilities;
}
