import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import cloudinary from "@/lib/cloudinary";

export const config = { api: { bodyParser: false } };

function badRequest(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return badRequest("Missing authorization token", 401);
    }
    const token = authHeader.replace("Bearer ", "");
    const decoded = await adminAuth().verifyIdToken(token);
    const uid = decoded.uid;

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) ?? "jodohmu";

    if (!file) return badRequest("No file provided");

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return badRequest("File type not allowed. Use JPG, PNG, WEBP, or HEIC.");
    }

    const maxSizeMb = 10;
    if (file.size > maxSizeMb * 1024 * 1024) {
      return badRequest(`File too large. Max ${maxSizeMb}MB.`);
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `${folder}/${uid}`,
          resource_type: "image",
          // Resize to max 800px wide and compress — keeps output under ~500KB
          transformation: [{ width: 800, crop: "limit", quality: "auto:good", fetch_format: "auto" }],
        },
        (error, result) => {
          if (error || !result) return reject(error ?? new Error("Upload failed"));
          resolve({ secure_url: result.secure_url, public_id: result.public_id });
        }
      );
      stream.end(buffer);
    });

    return NextResponse.json({ url: result.secure_url, publicId: result.public_id });
  } catch (error) {
    console.error("Upload error", error);
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
