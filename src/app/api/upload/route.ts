import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { guardApi } from "@/lib/auth";
import { STAFF_WRITE_ROLES, CHAPTER_ROLES } from "@/lib/roles";

export async function POST(request: Request) {
  // Uploads write to org storage — authenticated portal users only
  const { error } = await guardApi([...STAFF_WRITE_ROLES, ...CHAPTER_ROLES]);
  if (error) return error;
  try {
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      try {
        const uploadResponse = await new Promise<any>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "cucaso_documents",
              resource_type: "auto",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(buffer);
        });

        return NextResponse.json({
          success: true,
          url: uploadResponse.secure_url,
          public_id: uploadResponse.public_id,
          format: uploadResponse.format,
          bytes: uploadResponse.bytes,
        });
      } catch (cloudinaryErr) {
        console.warn("Cloudinary upload failed, falling back to data URL:", cloudinaryErr);
      }
    }

    // High-fidelity fallback: save to public/uploads/
    try {
      const fs = await import("fs/promises");
      const path = await import("path");
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(uploadsDir, { recursive: true });
      const rawExt = (file.type?.split("/")[1] || "png").replace("svg+xml", "svg");
      const ext = ["jpeg", "jpg", "png", "webp", "gif", "svg"].includes(rawExt) ? rawExt : "png";
      const safeName = `upload-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const filePath = path.join(uploadsDir, safeName);
      await fs.writeFile(filePath, buffer);

      return NextResponse.json({
        success: true,
        url: `/uploads/${safeName}`,
        format: ext,
        bytes: buffer.length,
      });
    } catch (diskErr) {
      console.warn("Could not save to disk, using data URL fallback:", diskErr);
      const mimeType = file.type || "image/jpeg";
      const base64Data = buffer.toString("base64");
      const dataUrl = `data:${mimeType};base64,${base64Data}`;
      return NextResponse.json({
        success: true,
        url: dataUrl,
        format: mimeType.split("/")[1] || "jpeg",
        bytes: buffer.length,
      });
    }
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Upload failed" },
      { status: 500 }
    );
  }
}
