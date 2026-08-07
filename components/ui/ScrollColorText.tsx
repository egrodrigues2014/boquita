"use client";

import { useEffect, useRef } from "react";

type ScrollSegment = string | { text: string; tone?: "title" | "body" };

function clamp(value: number) {
  return Math.min(1, Math.max(0, value));
}

function normalize(segment: ScrollSegment) {
  return typeof segment === "string" ? { text: segment, tone: undefined } : segment;
}

export function ScrollColorText({
  id,
  segments,
  className,
}: {
  id?: string;
  segments: readonly ScrollSegment[];
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const update = () => {
      const lines = [...element.querySelectorAll<HTMLElement>(".scroll-color-text__line")];
      if (reduceMotion.matches) {
        for (const line of lines) line.style.setProperty("--reveal", "100%");
        return;
      }

      const rect = element.getBoundingClientRect();
      const progress = clamp((window.innerHeight - rect.top) / window.innerHeight);

      lines.forEach((line, index) => {
        const reveal = clamp(progress * lines.length - index);
        line.style.setProperty("--reveal", `${Math.round(reveal * 100)}%`);
      });
    };

    const schedule = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    reduceMotion.addEventListener("change", schedule);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      reduceMotion.removeEventListener("change", schedule);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={className ? `scroll-color-text ${className}` : "scroll-color-text"}
    >
      <h2 id={id} className="scroll-color-text__heading">
        {segments.map((segment) => {
          const { text, tone = "body" } = normalize(segment);

          return (
            <span
              className={`scroll-color-text__line scroll-color-text__line--${tone}`}
              key={text}
            >
              <span className="scroll-color-text__base">{text}</span>
              <span className="scroll-color-text__fill" aria-hidden="true">
                {text}
              </span>
            </span>
          );
        })}
      </h2>
    </div>
  );
}
