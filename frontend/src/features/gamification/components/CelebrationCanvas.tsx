// src/features/gamification/components/CelebrationCanvas.tsx
import React, { useEffect, useRef } from "react";
import type { AchievementTier } from "../types/gamification.types";

interface CelebrationCanvasProps {
  tier?: AchievementTier;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  vRot: number;
  shape: "rect" | "circle" | "star";
  alpha: number;
  decay: number;
  aspectRatio: number;
}

const TIER_PALETTES: Record<AchievementTier, string[]> = {
  BRONZE: ["#F59E0B", "#D97706", "#B45309", "#5BE584", "#FDE68A"],
  SILVER: ["#CBD5E1", "#94A3B8", "#64748B", "#5BE584", "#F8FAFC"],
  GOLD: ["#FBBF24", "#F59E0B", "#D97706", "#5BE584", "#FEF08A"],
  PLATINUM: ["#67E8F9", "#22D3EE", "#06B6D4", "#5BE584", "#CFFAFE"],
  DIAMOND: ["#C084FC", "#A855F7", "#7E22CE", "#5BE584", "#F3E8FF"],
};

export const CelebrationCanvas: React.FC<CelebrationCanvasProps> = ({
  tier = "GOLD",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Respect user's motion preferences
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);

    const colors = TIER_PALETTES[tier] || TIER_PALETTES.GOLD;
    const particles: Particle[] = [];
    const count = 75;
    const originX = window.innerWidth / 2;
    const originY = window.innerHeight / 2 - 40;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 8.5;
      const shapes: ("rect" | "circle" | "star")[] = [
        "rect",
        "rect",
        "circle",
        "star",
      ];
      particles.push({
        x: originX + (Math.random() - 0.5) * 30,
        y: originY + (Math.random() - 0.5) * 30,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2.5,
        size: 5 + Math.random() * 7,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.2,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        alpha: 1,
        decay: 0.007 + Math.random() * 0.008,
        aspectRatio: 0.4 + Math.random() * 0.6,
      });
    }

    const gravity = 0.16;
    const drag = 0.985;

    const render = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      let aliveCount = 0;
      for (const p of particles) {
        if (p.alpha <= 0) continue;
        aliveCount++;

        p.x += p.vx;
        p.y += p.vy;
        p.vy += gravity;
        p.vx *= drag;
        p.vy *= drag;
        p.rotation += p.vRot;
        p.alpha = Math.max(0, p.alpha - p.decay);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;

        if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === "rect") {
          ctx.fillRect(
            -p.size / 2,
            -(p.size * p.aspectRatio) / 2,
            p.size,
            p.size * p.aspectRatio,
          );
        } else if (p.shape === "star") {
          ctx.beginPath();
          const spikes = 5;
          const outerRadius = p.size / 1.5;
          const innerRadius = outerRadius / 2;
          let rot = (Math.PI / 2) * 3;
          const step = Math.PI / spikes;

          ctx.moveTo(0, -outerRadius);
          for (let i = 0; i < spikes; i++) {
            let x = Math.cos(rot) * outerRadius;
            let y = Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;

            x = Math.cos(rot) * innerRadius;
            y = Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
          }
          ctx.lineTo(0, -outerRadius);
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();
      }

      if (aliveCount > 0) {
        animId = requestAnimationFrame(render);
      }
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [tier]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[101] w-full h-full"
      aria-hidden="true"
    />
  );
};

export default CelebrationCanvas;
