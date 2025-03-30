import { LoaderPinwheel } from "lucide-react";

export const LoaderCircle = () => {
  return (
    <div className="flex items-center justify-center h-48">
      <LoaderPinwheel className="w-8 h-8 animate-spin text-white" />
    </div>
  );
};
