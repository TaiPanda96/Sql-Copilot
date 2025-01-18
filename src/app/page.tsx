import { AsciiBackground } from "@sql-copilot/lib/components/ascii-background";
import { ChatInterface } from "@sql-copilot/lib/components/chat-interface";
import { UploadForm } from "@sql-copilot/lib/components/upload-form";
import { VisualizationChart } from "@sql-copilot/lib/components/visualization-charts";

export default function Home() {
  return (
      <div className="min-h-screen bg-transparent">
          <AsciiBackground />
          <div className="container mx-auto px-4 py-16 relative" style={{ zIndex: 1 }}>
              <div className="max-w-4xl mx-auto space-y-12">
                  <h1 className="text-[40px] leading-tight font-semibold text-center text-gray-900">
                      What story can we help you tell?
                  </h1>
                  <UploadForm />
              </div>
          </div>
      </div>
  );
}