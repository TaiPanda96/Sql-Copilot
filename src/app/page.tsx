import { BrownianLine } from "@sql-copilot/lib/components/brownian-line";
import { UploadForm } from "@sql-copilot/lib/components/upload-form";

export default function Page() {
  return (
    <div className="min-h-screen bg-excel-light font-excel">
      <BrownianLine />

      <div className="relative container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-12">
          <h1 className="text-[40px] leading-tight font-excel-bold text-center text-excel-dark tracking-tight">
            Build beautiful charts with AI
          </h1>
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-excel">
            <UploadForm />
          </div>
        </div>
      </div>
    </div>
  );
}