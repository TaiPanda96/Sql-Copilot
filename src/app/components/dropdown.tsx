"use-client";
import { TextInput } from "./text-input";

interface DropdownProps {
  title: string;
  children: React.ReactNode;
}

export function Dropdown({ title, children }: DropdownProps) {
  return (
    <div
      id="dropdown"
      className="z-10 hidden w-56 p-3 rounded-lg shadow dark:bg-gray-700"
    >
      <TextInput value={title} as="h3" color="regular" bold />
      <ul className="space-y-2 text-sm" aria-labelledby="dropdownDefault">
        {children}
      </ul>
    </div>
  );
}

export default Dropdown;
