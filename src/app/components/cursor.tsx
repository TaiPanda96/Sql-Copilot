"use client";
import React, { useEffect, useState } from "react";
import styles from "./cursor.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMugHot } from "@fortawesome/free-solid-svg-icons/faMugHot";

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDarkHover, setIsDarkHover] = useState(false);

  useEffect(() => {
    const onMouseMove = (e: { clientX: number; clientY: number }) => {
      setPosition({ x: e.clientX, y: e.clientY });

      const hoverElement = document.elementFromPoint(e.clientX, e.clientY);
      if (hoverElement) {
        const computedStyle = window.getComputedStyle(hoverElement);
        const backgroundColor =
          computedStyle.getPropertyValue("background-color");

        // You can adjust this threshold to your preference
        const isDarker = isColorDarker(backgroundColor, "#000000", 0.5);
        setIsDarkHover(isDarker);
      }
    };

    document.addEventListener("mousemove", onMouseMove);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  const cursorStyle = {
    transform: `translate(${position.x}px, ${position.y}px)`,
    color: isDarkHover ? "#ffffff" : "#3A3226",
  };

  return (
    <div className={styles.cursor} style={cursorStyle}>
      <FontAwesomeIcon
        icon={faMugHot}
        size="2xl"
        style={{ color: isDarkHover ? "#ffffff" : "#3A3226" }}
      />
    </div>
  );
};

// Helper function to determine if one color is darker than another
function isColorDarker(color1: string, color2: string, threshold: number) {
  // Function to convert a color to grayscale
  const toGrayscale = (color: string) => {
    const rgb = parseInt(color.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = rgb & 0xff;
    return 0.299 * r + 0.587 * g + 0.114 * b;
  };

  const brightness1 = toGrayscale(color1);
  const brightness2 = toGrayscale(color2);

  // Compare brightness and apply the threshold
  return brightness1 < brightness2 * threshold;
}

export default CustomCursor;
