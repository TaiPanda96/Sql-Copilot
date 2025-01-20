"use client";

import React from "react";

export function DynamicVisualization({ iframeUrl }: { iframeUrl: string }) {
  console.log("Rendering dynamic visualization with URL:", iframeUrl);
  return (
    <iframe
      src={iframeUrl}
      className="w-full h-96 bg-white rounded-lg shadow-sm"
      sandbox="allow-scripts allow-same-origin"
      title="Dynamic Visualization"
    />
  );
}
