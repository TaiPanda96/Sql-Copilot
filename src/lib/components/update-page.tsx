import { AsciiBackground } from "./ascii-background";
import { UploadForm } from "./upload-form";

export default function Home() {
    function generateAsciiTitle(arg0: string): import("react").ReactNode {
        throw new Error("Function not implemented.");
    }

    return (
        <div className="min-h-screen bg-transparent">
            <AsciiBackground />
            <div className="container mx-auto px-4 py-16 relative z-10">
                <div className="max-w-4xl mx-auto space-y-12">
                    <pre className="text-center font-bold text-gray-900 text-[40px] leading-tight whitespace-pre-wrap">
                        {generateAsciiTitle("What story can we help you tell?")}
                    </pre>
                    <UploadForm />
                </div>
            </div>
        </div>
    );
}