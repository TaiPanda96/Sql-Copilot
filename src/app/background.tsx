export const Background = () => {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-excel-accent via-excel-light to-excel-gray" />
      
      {/* Animated Blobs */}
      <div className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-excel-secondary/30 blur-[120px] animate-blob" />
      <div className="absolute -bottom-[40%] -right-[20%] w-[80%] h-[80%] rounded-full bg-excel-accent/30 blur-[120px] animate-blob animation-delay-2000" />
      <div className="absolute top-[20%] right-[20%] w-[40%] h-[40%] rounded-full bg-excel-primary/20 blur-[120px] animate-blob animation-delay-4000" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.2]" />
    </div>
  );
};