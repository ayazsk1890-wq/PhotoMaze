import { NextResponse } from "next/server";
import sharp from "sharp";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;
    const cropX = Math.round(Number(formData.get("cropX") || 0));
    const cropY = Math.round(Number(formData.get("cropY") || 0));
    const cropWidth = Math.round(Number(formData.get("cropWidth") || 0));
    const cropHeight = Math.round(Number(formData.get("cropHeight") || 0));
    const rotation = Math.round(Number(formData.get("rotation") || 0));
    const targetWidth = Math.round(Number(formData.get("targetWidth") || 600));
    const targetHeight = Math.round(Number(formData.get("targetHeight") || 600));
    const format = (formData.get("format") as string) || "jpeg";
    const enhanceEnabled = formData.get("enhancementEnabled") === "true";
    const brightness = Number(formData.get("brightness") || 0);
    const contrast = Number(formData.get("contrast") || 0);
    const saturation = Number(formData.get("saturation") || 0);
    const sharpness = Number(formData.get("sharpness") || 0);

    if (!file) {
      return NextResponse.json({ success: false, error: "No image file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let pipeline = sharp(buffer);

    // Apply rotation if needed
    if (rotation !== 0) {
      pipeline = pipeline.rotate(rotation, { background: { r: 255, g: 255, b: 255, alpha: 1 } });
    }

    const metadata = await pipeline.metadata();
    const imgWidth = metadata.width || 0;
    const imgHeight = metadata.height || 0;

    // Constrain crop region within image bounds
    if (cropWidth > 0 && cropHeight > 0) {
      const left = Math.max(0, Math.min(imgWidth - 1, cropX));
      const top = Math.max(0, Math.min(imgHeight - 1, cropY));
      const width = Math.min(imgWidth - left, cropWidth);
      const height = Math.min(imgHeight - top, cropHeight);

      if (width > 0 && height > 0) {
        pipeline = pipeline.extract({ left, top, width, height });
      }
    }

    // Resize to exact target passport dimensions at 300 DPI
    pipeline = pipeline.resize(targetWidth, targetHeight, {
      fit: "cover",
      position: "center",
      kernel: sharp.kernel.lanczos3,
    });

    // Optional portrait enhancement pipeline (Phase 7)
    if (enhanceEnabled || brightness !== 0 || contrast !== 0 || saturation !== 0 || sharpness !== 0) {
      const brightMul = Math.max(0.5, Math.min(1.5, 1 + brightness / 100));
      const satMul = Math.max(0.5, Math.min(1.5, 1 + saturation / 100));
      pipeline = pipeline.modulate({ brightness: brightMul, saturation: satMul });

      if (contrast !== 0) {
        const factor = Math.max(0.5, Math.min(1.5, (100 + contrast) / 100));
        const offset = -(128 * (factor - 1));
        pipeline = pipeline.linear(factor, offset);
      }

      if (sharpness > 0) {
        const sigma = 0.5 + (sharpness / 100) * 1.0;
        pipeline = pipeline.sharpen({ sigma, m1: 0.5, m2: 2.0 });
      }
    }

    // Set 300 DPI density metadata for print readiness
    pipeline = pipeline.withMetadata({ density: 300 });

    let outputBuffer: Buffer;
    let contentType = "image/jpeg";

    if (format === "png") {
      outputBuffer = await pipeline.png({ quality: 100, compressionLevel: 9 }).toBuffer();
      contentType = "image/png";
    } else {
      outputBuffer = await pipeline.jpeg({ quality: 95, mozjpeg: true }).toBuffer();
      contentType = "image/jpeg";
    }

    return new NextResponse(new Uint8Array(outputBuffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="passport-photo-300dpi.${format === "png" ? "png" : "jpg"}"`,
      },
    });
  } catch (error) {
    console.error("Sharp crop processing error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to process image with Sharp",
      },
      { status: 500 }
    );
  }
}
