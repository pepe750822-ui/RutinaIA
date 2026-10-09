"use client";

import { useRef, useState } from "react";
import type { FoodAnalysis } from "@/types/food";

interface Props {
  onAnalysis: (result: { photo_job_id: string; photo_url: string; analysis: FoodAnalysis }) => void;
}

export default function FoodCamera({ onAnalysis }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [streaming, setStreaming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startCamera() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setStreaming(true);
      }
    } catch {
      setError("No se pudo acceder a la cámara.");
    }
  }

  function stopCamera() {
    const video = videoRef.current;
    if (video?.srcObject) {
      (video.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      video.srcObject = null;
    }
    setStreaming(false);
  }

  async function capture() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      stopCamera();
      setLoading(true);
      setError(null);

      const form = new FormData();
      form.append("image", blob, "photo.jpg");

      try {
        const res = await fetch("/api/food/analyze", { method: "POST", body: form });
        const json = await res.json();

        if (!res.ok) {
          const code = json?.error?.code as string | undefined;
          if (code === "insufficient_credits") {
            setError("Sin créditos de fotos por hoy.");
          } else if (code === "gemini_timeout") {
            setError("El análisis tardó demasiado. Intenta de nuevo.");
          } else {
            setError("Error al analizar la foto.");
          }
          return;
        }

        onAnalysis(json.data);
      } catch {
        setError("Error de red. Intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    }, "image/jpeg");
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-full max-w-sm aspect-square rounded-2xl overflow-hidden bg-neutral-900">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
        />
        {!streaming && !loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-neutral-500 text-sm">Cámara apagada</span>
          </div>
        )}
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 gap-2">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span className="text-white text-sm">Analizando…</span>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {error && (
        <p role="alert" className="text-red-500 text-sm text-center">
          {error}
        </p>
      )}

      {!streaming && !loading && (
        <button
          onClick={startCamera}
          className="w-full max-w-sm py-3 rounded-xl bg-[--accent] text-white font-semibold active:scale-95 transition-transform"
        >
          Abrir cámara
        </button>
      )}

      {streaming && (
        <button
          onClick={capture}
          className="w-16 h-16 rounded-full bg-white border-4 border-[--accent] active:scale-90 transition-transform shadow-lg"
          aria-label="Capturar foto"
        />
      )}
    </div>
  );
}
