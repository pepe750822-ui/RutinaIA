"use server";

import fs from "fs";
import path from "path";

const RAPIDAPI_HOST = "edb-with-videos-and-images-by-ascendapi.p.rapidapi.com";
const SEARCH_URL = `https://${RAPIDAPI_HOST}/api/v1/exercises/search`;
const CACHE_PATH = path.join(process.cwd(), "public", "data", "exercisedb-cache.json");

interface MediaCache {
  [name: string]: MediaResult | null;
}

interface MediaResult {
  imageUrl: string;
  videoUrl?: string;
}

let memoryCache: MediaCache | null = null;

function loadCache(): MediaCache {
  if (memoryCache) return memoryCache;
  try {
    if (fs.existsSync(CACHE_PATH)) {
      memoryCache = JSON.parse(fs.readFileSync(CACHE_PATH, "utf-8"));
    }
  } catch {}
  memoryCache = memoryCache || {};
  return memoryCache;
}

function saveCache(cache: MediaCache): void {
  try {
    fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2), "utf-8");
  } catch {}
}

export async function searchExerciseMedia(
  name: string
): Promise<MediaResult | null> {
  if (!name) return null;
  const key = name.toLowerCase().trim();
  const cache = loadCache();
  if (key in cache) return cache[key];

  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) {
    cache[key] = null;
    return null;
  }

  try {
    const url = `${SEARCH_URL}?search=${encodeURIComponent(name)}`;
    const res = await fetch(url, {
      headers: {
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": RAPIDAPI_HOST,
      },
      next: { revalidate: 86400 },
    });
    if (!res.ok) {
      cache[key] = null;
      saveCache(cache);
      return null;
    }
    const body = await res.json();
    const items = body?.data;
    if (!items || !items.length) {
      cache[key] = null;
      saveCache(cache);
      return null;
    }
    const best = items[0];
    const result: MediaResult = {
      imageUrl: best.imageUrl || "",
      videoUrl: best.videoUrl || undefined,
    };
    cache[key] = result;
    saveCache(cache);
    return result;
  } catch {
    cache[key] = null;
    saveCache(cache);
    return null;
  }
}

export async function getExerciseMediaUrl(
  name: string
): Promise<string | null> {
  const media = await searchExerciseMedia(name);
  return media?.imageUrl || null;
}
