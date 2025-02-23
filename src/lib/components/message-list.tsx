import { useState, useEffect } from "react";

export function MessageList({ message }: { message: string }) {
  const [displayedText, setDisplayedText] = useState("");
  /**
   * Use Effect to simulate typing effect on message
   * @param message - Message to be displayed
   * this effect will run every time the message changes
   */
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index <= message.length) {
        setDisplayedText(message.slice(0, index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 25);
    return () => clearInterval(interval);
  }, [message]);

  return (
    <div className="p-2 bg-gray-100 rounded-md mb-2">
      <p className="text-sm text-gray-800">{displayedText}</p>
    </div>
  );
}
