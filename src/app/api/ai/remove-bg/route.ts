import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;
    const provider = (process.env.AI_BG_REMOVAL_PROVIDER || "client_webgpu").toLowerCase();

    if (!file) {
      return NextResponse.json({ success: false, error: "No image file provided" }, { status: 400 });
    }

    // 1. Photoroom Provider Adapter
    if (provider === "photoroom" && process.env.PHOTOROOM_API_KEY) {
      const photoroomForm = new FormData();
      photoroomForm.append("image_file", file);

      const res = await fetch("https://sdk.photoroom.com/v1/segment", {
        method: "POST",
        headers: {
          "x-api-key": process.env.PHOTOROOM_API_KEY,
        },
        body: photoroomForm,
      });

      if (!res.ok) {
        throw new Error(`Photoroom API error: ${res.status} ${res.statusText}`);
      }

      const buffer = await res.arrayBuffer();
      return new NextResponse(new Uint8Array(buffer), {
        status: 200,
        headers: { "Content-Type": "image/png" },
      });
    }

    // 2. Replicate BiRefNet Provider Adapter
    if (provider === "replicate" && process.env.REPLICATE_API_TOKEN) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const base64Image = `data:${file.type};base64,${buffer.toString("base64")}`;

      const res = await fetch("https://api.replicate.com/v1/predictions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          version: "biresnet/birefnet:latest",
          input: { image: base64Image },
        }),
      });

      if (!res.ok) {
        throw new Error(`Replicate API error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      return NextResponse.json({ success: true, result: data });
    }

    // 3. Zero-Cost Client Fallback
    // When no paid API keys are configured, inform client to use the zero-cost in-browser WebGPU/WASM model
    return NextResponse.json({
      success: true,
      strategy: "client_webgpu",
      message: "No paid API keys configured. Using zero-cost in-browser WebGPU/WASM neural segmentation.",
    });
  } catch (error) {
    console.error("Background removal API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to remove background",
      },
      { status: 500 }
    );
  }
}

