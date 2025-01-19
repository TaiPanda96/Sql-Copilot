import { UploadForm } from "./upload-form";

export default function UpdatePage(): JSX.Element {
  return (
    <div className="min-h-screen bg-transparent">
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-4xl mx-auto space-y-12">
                    <pre className="text-center font-bold text-gray-900 text-[40px] leading-tight whitespace-pre-wrap">
                        ("What story can we help you tell?")
                    </pre>
                    <UploadForm />
                </div>
            </div>
        </div>
    );
}