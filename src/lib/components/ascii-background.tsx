"use client";

import { useEffect, useRef } from "react";

export const TECH_WORDS = [
  "growth_hack",
  "unicorn",
  "hockey_stick",
  "north_star",
  "cohort",
  "churn_rate",
  "burn_rate",
  "runway",
  "pivot",
  "MVP",
  "PMF",
  "conversion",
  "retention",
  "activation",
  "referral",
  "revenue",
  "DAU",
  "MAU",
  "WAU",
  "CAC",
  "LTV",
  "ARPU",
  "NPS",
  "ROI",
  "virality",
  "stickiness",
  "engagement",
  "funnel",
  "pipeline",
  "bottleneck",
  "optimization",
  "scale",
  "traction",
  "momentum",
  "disruption",
  "paradigm",
  "synergy",
  "leverage",
  "ecosystem",
  "moonshot",
  "10x",
  "rocketship",
  "hypergrowth",
  "blitzscaling",
  "product_market_fit",
  "go_to_market",
  "first_principles",
  "zero_to_one",
  "network_effects",
  "flywheel",
  "moat",
  "TAM",
  "SAM",
  "SOM",
  "KPI",
  "OKR",
  "A_B_test",
  "power_user",
];

class ASCIIEffect {
  private container: HTMLPreElement;
  private grid: string[][];
  private originalGrid: string[][];
  private animationId: number | null;
  private mousePos: { x: number; y: number } | null;
  private width: number;
  private height: number;
  private charSize = { width: 7.2, height: 15 }; // Adjusted for more precise positioning

  constructor(container: HTMLPreElement, width: number, height: number) {
    this.container = container;
    this.width = width + 10;
    this.height = height + 5;
    this.animationId = null;
    this.mousePos = null;
    [this.grid, this.originalGrid] = this.createInitialGrid();
    this.init();
  }

  private createInitialGrid(): [string[][], string[][]] {
    const grid: string[][] = [];
    const original: string[][] = [];

    for (let y = 0; y < this.height; y++) {
      const row: string[] = [];
      const originalRow: string[] = [];

      if (Math.random() < 0.3) {
        const word = TECH_WORDS[Math.floor(Math.random() * TECH_WORDS.length)];
        const offset = Math.floor(Math.random() * (this.width - word.length));

        for (let x = 0; x < this.width; x++) {
          if (x >= offset && x < offset + word.length) {
            const char = word[x - offset];
            row.push(char);
            originalRow.push(char);
          } else {
            const char =
              Math.random() > 0.95
                ? String.fromCharCode(33 + Math.floor(Math.random() * 94))
                : " ";
            row.push(char);
            originalRow.push(char);
          }
        }
      } else {
        for (let x = 0; x < this.width; x++) {
          const char =
            Math.random() > 0.98
              ? String.fromCharCode(33 + Math.floor(Math.random() * 94))
              : " ";
          row.push(char);
          originalRow.push(char);
        }
      }

      grid.push(row);
      original.push(originalRow);
    }
    return [grid, original];
  }

  private init(): void {
    this.setupMouseEvents();
    this.animate = this.animate.bind(this);
    this.animate();
  }

  private setupMouseEvents(): void {
    const handleMouseMove = (e: MouseEvent) => {
      const rect = this.container.getBoundingClientRect();
      this.mousePos = {
        x: Math.floor((e.clientX - rect.left) / (this.charSize.width * 0.95)), // Added scaling factor
        y: Math.floor((e.clientY - rect.top) / (this.charSize.height * 0.95)), // Added scaling factor
      };
    };

    const handleMouseLeave = () => {
      this.mousePos = null;
      this.grid = this.originalGrid.map((row) => [...row]);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
  }

  private updateGrid(): void {
    if (this.mousePos) {
      const radius = 4;
      const intensity = 0.8;

      for (
        let y = Math.max(0, this.mousePos.y - radius);
        y < Math.min(this.height, this.mousePos.y + radius);
        y++
      ) {
        for (
          let x = Math.max(0, this.mousePos.x - radius);
          x < Math.min(this.width, this.mousePos.x + radius);
          x++
        ) {
          const distance = Math.sqrt(
            Math.pow(x - this.mousePos.x, 2) + Math.pow(y - this.mousePos.y, 2)
          );

          if (distance < radius) {
            const changeProb = (1 - distance / radius) * intensity;
            if (Math.random() < changeProb) {
              const randomWord =
                TECH_WORDS[Math.floor(Math.random() * TECH_WORDS.length)];
              this.grid[y][x] =
                randomWord[Math.floor(Math.random() * randomWord.length)];
            }
          } else {
            this.grid[y][x] = this.originalGrid[y][x];
          }
        }
      }
    }
  }

  private render(): void {
    this.container.textContent = this.grid
      .map((row) => row.join(""))
      .join("\n");
  }

  private animate(): void {
    this.updateGrid();
    this.render();
    this.animationId = requestAnimationFrame(this.animate);
  }

  public cleanup(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}

export function AsciiBackground() {
  const containerRef = useRef<HTMLPreElement>(null);
  const effectRef = useRef<ASCIIEffect | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      const width = Math.ceil(window.innerWidth / 8) + 20;
      const height = Math.ceil(window.innerHeight / 16) + 10;
      effectRef.current = new ASCIIEffect(containerRef.current, width, height);
    }

    const handleResize = () => {
      if (containerRef.current) {
        effectRef.current?.cleanup();
        const width = Math.ceil(window.innerWidth / 8) + 20;
        const height = Math.ceil(window.innerHeight / 16) + 10;
        effectRef.current = new ASCIIEffect(
          containerRef.current,
          width,
          height
        );
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      effectRef.current?.cleanup();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 0 }}
    >
      <pre
        ref={containerRef}
        className="w-full h-full whitespace-pre font-mono text-[12px] leading-[15px] select-none" // Adjusted font size and line height
        style={{
          color: "#2a52be",
          opacity: 0.15,
          fontFamily: "Consolas, monospace",
          letterSpacing: "0px", // Added to ensure proper character spacing
          transform: "scale(1.1)",
        }}
      />
    </div>
  );
}
