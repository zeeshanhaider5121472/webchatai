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
    const DENSITY = 5;

    const RINGS = Math.floor(10 + DENSITY * 2); // 12 → 30 rings
    const PER_RING = Math.floor(40 + DENSITY * 16); // 56 → 200 per ring
    let W: number, H: number, cx: number, cy: number, R: number;

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
  ctx.fillStyle = "rgba(255,255,255,0.15)"; // white with slight transparency
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

          const rad = baseRadius * (1 + wave);
          const x = cx + Math.cos(angle) * rad;
          const y = cy + Math.sin(angle) * rad;
          // Part Effect
          // r * 14color difference between ring
          // st * 25how fast colors rotate/cycle
          // 90% in hslasaturation
          // lit brightness based on wave intensity
          const hue = (270 + Math.sin(angle * 2 + t) * 40 + r * 8) % 360;
          const intensity = 0.4 + ((wave + 0.26) / 0.52) * 0.6;
          const lit = 40 + intensity * 40;
          const alpha = 0.4 + intensity * 0.6;
          const radius = 0.8 + intensity * 1.4;

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

    const observer = new ResizeObserver(() => {
      resize();
    });
    observer.observe(canvas);

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

// // components/WaveAnimation.js
// export default function WaveAnimation() {
//   return (
//     <svg
//       width="600"
//       height="400"
//       viewBox="0 0 600 400"
//       xmlns="http://www.w3.org/2000/svg"
//     >
//       <defs>
//         <radialGradient id="dotGradient" cx="50%" cy="50%" r="50%">
//           <stop offset="0%" stop-color="#ff00ff" />
//           <stop offset="50%" stop-color="#00ffff" />
//           <stop offset="100%" stop-color="#ffff00" />
//         </radialGradient>
//       </defs>

//       {/* <!-- Group of animated dots --> */}
//       <g>
//         <circle cx="300" cy="200" r="4" fill="url(#dotGradient)">
//           <animate
//             attributeName="cx"
//             values="280;320;280"
//             dur="6s"
//             repeatCount="indefinite"
//           />
//           <animate
//             attributeName="cy"
//             values="180;220;180"
//             dur="6s"
//             repeatCount="indefinite"
//           />
//         </circle>

//         <circle cx="250" cy="150" r="3" fill="url(#dotGradient)">
//           <animate
//             attributeName="cx"
//             values="230;270;230"
//             dur="5s"
//             repeatCount="indefinite"
//           />
//           <animate
//             attributeName="cy"
//             values="130;170;130"
//             dur="5s"
//             repeatCount="indefinite"
//           />
//         </circle>

//         <circle cx="350" cy="250" r="5" fill="url(#dotGradient)">
//           <animate
//             attributeName="cx"
//             values="330;370;330"
//             dur="7s"
//             repeatCount="indefinite"
//           />
//           <animate
//             attributeName="cy"
//             values="230;270;230"
//             dur="7s"
//             repeatCount="indefinite"
//           />
//         </circle>

//         {/* <!-- Add more circles for mesh effect --> */}
//         <circle cx="400" cy="180" r="3" fill="url(#dotGradient)">
//           <animate
//             attributeName="cx"
//             values="380;420;380"
//             dur="4s"
//             repeatCount="indefinite"
//           />
//           <animate
//             attributeName="cy"
//             values="160;200;160"
//             dur="4s"
//             repeatCount="indefinite"
//           />
//         </circle>
//       </g>
//     </svg>
//   );
// }
