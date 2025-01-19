'use client'

import { useEffect, useRef } from 'react';

export function BrownianLine() {
  // Define colors for each line
  const lineColors = [
    '#FF6B6B', // coral red
    '#4ECDC4', // turquoise
    '#45B7D1', // sky blue
    '#96CEB4', // sage green
  ];

  const pathRefs = Array(4).fill(null).map(() => useRef<SVGPathElement>(null));
  
  useEffect(() => {
    function generatePath(seed: number, time: number, yOffset: number) {
      const width = window.innerWidth;
      const points = 12;
      const segmentWidth = width / (points - 1);
      
      const baseY = yOffset;
      let path = `M -100 ${baseY}`;

      for (let i = 0; i <= points; i++) {
        const x = i * segmentWidth - 100;
        const y = baseY + 
          Math.sin(time * 0.0008 + i * 0.5 + seed) * 30 + 
          Math.sin(time * 0.0015 + i * 0.3 + seed) * 20;
        
        if (i === 0) {
          path += `M ${x} ${y}`;
        } else {
          const prevX = (i - 1) * segmentWidth - 100;
          const cpX1 = prevX + segmentWidth * 0.5;
          const cpX2 = x - segmentWidth * 0.5;
          path += ` C ${cpX1} ${y}, ${cpX2} ${y}, ${x} ${y}`;
        }
      }
      
      return path;
    }

    let animationFrameId: number;

    function animate() {
      const currentTime = Date.now();
      const height = window.innerHeight;
      
      pathRefs.forEach((ref, index) => {
        if (ref.current) {
          const yOffset = height * ((index + 1) * 0.2);
          const newPath = generatePath(index * Math.PI, currentTime, yOffset);
          ref.current.setAttribute('d', newPath);
        }
      });
      animationFrameId = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none">
      <svg className="w-full h-screen" preserveAspectRatio="none">
        {pathRefs.map((ref, index) => (
          <path
            key={index}
            ref={ref}
            className="transition-all duration-75 ease-linear"
            fill="none"
            stroke={lineColors[index]}
            strokeWidth="8" // Back to thick lines
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ 
              opacity: 0.7,
              filter: 'blur(0.5px)'
            }}
          />
        ))}
      </svg>
    </div>
  );
}