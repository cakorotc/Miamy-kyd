import * as React from "react";
import QRCode from "qrcode";
import { cn } from "@/lib/utils";

interface QrCodeProps {
  value: string;
  size?: number;
  className?: string;
}

/**
 * Draws the Meridian mark (globe + meridian ellipse) into the quiet zone
 * at the centre of the QR matrix so the brand survives scanning.
 */
function drawMark(ctx: CanvasRenderingContext2D, cx: number, cy: number, box: number): void {
  const r = box * 0.32;
  ctx.strokeStyle = "#38bdf8";
  ctx.lineWidth = Math.max(2, box * 0.055);
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(cx, cy, r * 0.42, r, 0, 0, Math.PI * 2);
  ctx.stroke();
}

export function QrCode({ value, size = 180, className }: QrCodeProps) {
  const [dataUrl, setDataUrl] = React.useState<string>("");

  React.useEffect(() => {
    let active = true;
    const render = async () => {
      try {
        const canvas = document.createElement("canvas");
        const scale = 2;
        await QRCode.toCanvas(canvas, value, {
          width: size * scale,
          margin: 1,
          color: { dark: "#0a0f1e", light: "#ffffff" },
          errorCorrectionLevel: "H",
        });
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const c = canvas.width / 2;
          const box = canvas.width * 0.24;
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(c - box / 2, c - box / 2, box, box);
          drawMark(ctx, c, c, box);
        }
        if (active) setDataUrl(canvas.toDataURL("image/png"));
      } catch {
        if (active) setDataUrl("");
      }
    };
    void render();
    return () => {
      active = false;
    };
  }, [value, size]);

  return (
    <div
      className={cn(
        "grid place-items-center rounded-card border border-border bg-white p-2 shadow-card",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {dataUrl ? (
        <img src={dataUrl} alt="QR code" className="h-full w-full" />
      ) : (
        <div className="h-full w-full animate-pulse bg-zinc-200" />
      )}
    </div>
  );
}
