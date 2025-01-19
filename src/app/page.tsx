import { PageContainer } from "@sql-copilot/lib/components/page-container";
import { UploadForm } from "@sql-copilot/lib/components/upload-form";

export default async function Home() {
  return (
    <PageContainer
      centerVertically={true}
      fullHeight={true}
      pageTitle={{
        text: "What story do you want to tell?",
        level: "h1",
        className: "text-gray-800 text-center mb-6", // Optional custom styles
      }}
    >
      <UploadForm />
    </PageContainer>
  );
}
