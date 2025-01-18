

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <AsciiBackground />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-12">
          <h1 className="text-[40px] leading-tight font-semibold text-center text-gray-900">
            What story can we help you tell?
          </h1>
          <UploadForm />
          <VisualizationChart />
          <ChatInterface />
        </div>
      </div>
    </div>
  )
}

