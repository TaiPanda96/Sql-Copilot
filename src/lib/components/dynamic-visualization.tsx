"use client";

import React, { useEffect, useRef } from "react";

interface DynamicVisualizationProps {
  componentCode: string; // React component code as a string
}

export function DynamicVisualization({
  componentCode,
}: DynamicVisualizationProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!componentCode || !iframeRef.current) return;

    const iframe = iframeRef.current;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;

    if (!iframeDoc) return;

    // Clear the iframe content before rendering
    iframeDoc.open();
    iframeDoc.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Visualization</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100%;
            background-color: #f9f9f9;
          }
        </style>
        <!-- Include Recharts and Lucid React libraries -->
        <script src="https://unpkg.com/react/umd/react.production.min.js"></script>
        <script src="https://unpkg.com/react-dom/umd/react-dom.production.min.js"></script>
        <script src="https://unpkg.com/recharts/umd/Recharts.min.js"></script>
        <script src="https://unpkg.com/lucid-react/dist/lucid-react.min.js"></script>
      </head>
      <body>
        <div id="root"></div>
        <script>
          // Mount the React component dynamically
          try {
            const React = window.React;
            const ReactDOM = window.ReactDOM;
            const Recharts = window.Recharts;
            const LucidReact = window.lucidReact;

            const DynamicComponent = ${componentCode};
            ReactDOM.render(React.createElement(DynamicComponent), document.getElementById('root'));
          } catch (error) {
            document.body.innerHTML = '<p style="color: red;">Error rendering visualization: ' + error.message + '</p>';
          }
        </script>
      </body>
      </html>
    `);
    iframeDoc.close();
  }, [componentCode]);

  return (
    <iframe
      ref={iframeRef}
      className="w-full h-96 bg-white rounded-lg shadow-sm"
      sandbox="allow-scripts allow-same-origin"
      title="Dynamic Visualization"
    />
  );
}
