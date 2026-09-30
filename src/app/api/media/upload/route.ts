import { NextRequest, NextResponse } from "next/server";
import { uploadToS3 } from "@/lib/s3";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const folder = form.get("target") as "assets" | "events" | null;
  const files = form.getAll("files") as File[];

  if (!folder) {
    return NextResponse.json({ error: "No folder" }, { status: 400 });
  }

  if (files.length === 0) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }

  const links = await Promise.all(
    files.map((file) => uploadToS3(file, folder)),
  );
  return NextResponse.json({ data: { links } });
}
