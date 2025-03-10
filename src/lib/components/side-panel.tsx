"use client";

import { cn } from "shadcn/lib/utils";
import { SectionCard } from "./section-card";
import { useState } from "react";
import { Button } from "./button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { motion } from "framer-motion";

export interface SidePanelProps {
  title: string;
  children?: React.ReactNode;
  className?: string;
  position: "top-right" | "bottom-right" | "right-full" | "left-full";
}

/**
 * This is the Side Panel component with
 * children props that can be collapsible.
 * By default, the panel is not collapsible.
 */
export function SidePanel({
  title,
  children,
  className,
  position = "top-right",
}: SidePanelProps) {
  const [collapsed, setPanelCollapse] = useState(false);

  /**
   * Panel position class based on the position prop.
   */
  const panelPositionClass = (() => {
    switch (position) {
      case "top-right":
        return "top-0 right-0";
      case "bottom-right":
        return "bottom-0 right-0";
      case "right-full":
        return "right-0 top-0 h-full";
      case "left-full":
        return "left-0 top-0 h-full";
      default:
        return "top-right";
    }
  })();

  return (
    <SectionCard
      title={title}
      className={cn(
        "flex flex-col overflow-hidden",
        panelPositionClass,
        className
      )}
    >
      <Button
        variant="ghost"
        onClick={() => {
          collapsed ? setPanelCollapse(false) : setPanelCollapse(true);
        }}
        IconRight={collapsed ? ChevronDown : ChevronUp}
      />

      {!collapsed && (
        <motion.div
          initial={{ opacity: 1, maxHeight: 1000 }}
          animate={{
            opacity: 1,
            maxHeight: collapsed ? 0 : 1000,
            transition: {
              duration: 0.3,
            },
          }}
          exit={{ opacity: 0, height: 0 }}
        >
          {children}
        </motion.div>
      )}
    </SectionCard>
  );
}
