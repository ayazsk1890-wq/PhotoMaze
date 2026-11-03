import { NextResponse } from "next/server";
import sharp from "sharp";

export async function GET() {
  try {
    // Verify Sharp image processing runtime capability
    const sampleImage = await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 4,
        background: { r: 59, g: 130, b: 246, alpha: 1 },
      },
    })
      .png()
      .toBuffer();

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      service: "PhotoMaze API",
      phase: 1,
      environment: {
        nodeVersion: process.version,
        sharpVersion: sharp.versions.sharp,
        vipsVersion: sharp.versions.vips,
        imageProcessingReady: sampleImage.length > 0,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

