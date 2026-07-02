import { NextRequest, NextResponse } from "next/server";
import { getExerciseMediaUrl } from "@/lib/exercisedb";

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name");
  if (!name) return NextResponse.json({ url: null }, { status: 400 });
  const url = await getExerciseMediaUrl(name);
  if (url) return NextResponse.redirect(url);
  return NextResponse.json({ url: null }, { status: 404 });
}

