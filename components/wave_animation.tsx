"use client";
import { useEffect, useRef } from "react";

export default function WaveAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let animId: number;
    let t = 0;

    // 👇 Change this one value — range: 1 (minimal) to 10 (dense)
    // Quick reference:
    // 1~200Ultra light 3~600Light 5~1,600 Default 7~3,200 Dense 10~6,000+ Heavy
    const DENSITY = 3;
    const RINGS = Math.floor(10 + DENSITY * 2);
    const PER_RING = Math.floor(40 + DENSITY * 16);

    let W: number, H: number, cx: number, cy: number, R: number;
    let pointerX: number | null = null;
    let pointerY: number | null = null;

    function resize() {
      W = canvas.offsetWidth;
      H = W;
      canvas.width = W;
      canvas.height = H;
      cx = W / 2;
      cy = H / 2;
      R = W * 0.38;
    }

    function draw() {
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.fillRect(0, 0, W, H);

      for (let r = 0; r < RINGS; r++) {
        const baseRadius = R * 0.15 + (r / (RINGS - 1)) * R * 0.85;
        const count = Math.floor(PER_RING * (0.3 + 0.7 * (r / (RINGS - 1))));

        for (let p = 0; p < count; p++) {
          const angle = (p / count) * Math.PI * 2;

          const wave =
            Math.sin(angle * 3 - t * 1.8 + r * 0.4) * 0.12 +
            Math.sin(angle * 5 + t * 1.2 - r * 0.3) * 0.08 +
            Math.sin(angle * 2 - t * 0.9 + r * 0.6) * 0.06;

          let rad = baseRadius * (1 + wave);
          let x = cx + Math.cos(angle) * rad;
          let y = cy + Math.sin(angle) * rad;

          // Part Effect
          // r * 14color difference between ring
          // st * 25how fast colors rotate/cycle
          // 90% in hslasaturation
          // lit brightness based on wave intensity
          const hue = (270 + Math.sin(angle * 2 + t) * 40 + r * 8) % 360;
          let intensity = 0.4 + ((wave + 0.26) / 0.52) * 0.6;
          let lit = 40 + intensity * 40;
          let alpha = 0.4 + intensity * 0.6;
          let radius = 0.8 + intensity * 1.4;

          // 🎯 Interaction effect
          if (pointerX !== null && pointerY !== null) {
            const dx = x - pointerX;
            const dy = y - pointerY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 80) {
              const factor = (80 - dist) / 80;
              radius += factor * 3; // enlarge
              lit = Math.min(100, lit + factor * 30); // brighten
              // optional repel effect:
              x += (dx / dist) * factor * 10;
              y += (dy / dist) * factor * 10;
            }
          }

          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${hue | 0},85%,${lit | 0}%,${alpha.toFixed(2)})`;
          ctx.fill();
        }
      }

      t += 0.018;
      animId = requestAnimationFrame(draw);
    }

    resize();
    draw();

    const observer = new ResizeObserver(() => resize());
    observer.observe(canvas);

    // 🖱️ Mouse events
    canvas.addEventListener("mousemove", (e) => {
      const rect = canvas.getBoundingClientRect();
      pointerX = e.clientX - rect.left;
      pointerY = e.clientY - rect.top;
    });
    canvas.addEventListener("mouseleave", () => {
      pointerX = null;
      pointerY = null;
    });

    // 📱 Touch events
    canvas.addEventListener("touchmove", (e) => {
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      pointerX = touch.clientX - rect.left;
      pointerY = touch.clientY - rect.top;
    });
    canvas.addEventListener("touchend", () => {
      pointerX = null;
      pointerY = null;
    });

    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: "block",
        width: "100%",
        background: "#FFF",
        borderRadius: 12,
      }}
    />
  );
}
