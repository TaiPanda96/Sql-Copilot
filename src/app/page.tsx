import { BrownianLine } from "@sql-copilot/lib/components/brownian-line";
import Visualization from "@sql-copilot/lib/components/visualization";

export default async function Page() {
  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <BrownianLine />
      <div className="relative container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-12">
          <h1 className="text-[40px] leading-tight font-semibold text-center text-gray-900">
            Build beautiful charts with AI
          </h1>
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg">
            <Visualization />
          </div>
        </div>
      </div>
    </div>
  );
}
