import { NextRequest, NextResponse } from "next/server";
import { searchExerciseMedia } from "@/lib/exercisedb";

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name");
  if (!name) return NextResponse.json({ imageUrl: null, videoUrl: null }, { status: 400 });
  const media = await searchExerciseMedia(name);
  return NextResponse.json({
    imageUrl: media?.imageUrl || null,
    videoUrl: media?.videoUrl || null,
  });
}
