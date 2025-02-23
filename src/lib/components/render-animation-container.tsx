import { motion } from "framer-motion";
import { cn } from "shadcn/lib/utils";

export interface RenderAnimationContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function RenderAnimationContainer({
  children,
  className,
}: RenderAnimationContainerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn("w-full", "flex", "flex-col", "space-y-4", className)}
    >
      {children}
    </motion.div>
  );
}
