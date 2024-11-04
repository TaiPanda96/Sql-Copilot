import { SidebarIcon } from "lucide-react";
import { Inline } from "./inline";
import SideBarItem from "./side-bar-item";
import { Stack } from "./stack";
import { useState } from "react";
import { BreadCrumb } from "@sql-copilot/app/chat/page";

export default function SideBarNav({
  currentUser,
  breadcrumbs,
}: {
  currentUser: { name: string | null; email: string | null } | null;
  breadcrumbs: BreadCrumb[];
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  function handleSidebarToggle(e: React.MouseEvent<SVGSVGElement>) {
    e.preventDefault();
    setIsSidebarOpen((prev) => !prev);
    if (isSidebarOpen) {
      document.body.classList.remove("overflow-hidden");
    } else {
      document.body.classList.add("overflow-hidden");
    }
  }

  return (
    <>
      {!isSidebarOpen && (
        <SidebarIcon
          size={24}
          className="fixed top-4 left-4 cursor-pointer z-50"
          onClick={handleSidebarToggle}
        />
      )}
      <div
        className={
          "fixed top-0 left-0 h-full w-64 bg-gray-800 text-white p-4 z-40 transition-transform transform " +
          (isSidebarOpen ? "translate-x-0" : "-translate-x-full")
        }
      >
        <Stack gap={4}>
          <Inline gap={2} justify="between" align="center">
            <h3 className="text-lg font-semibold">SQL Playground</h3>
            <SidebarIcon size={24} onClick={handleSidebarToggle} />
          </Inline>
          <Stack gap={2}>
            {breadcrumbs.map((breadcrumb, index) => (
              <SideBarItem
                href={breadcrumb.href}
                label={breadcrumb.label}
                key={index}
                readOnly={breadcrumb.readOnly}
              />
            ))}
          </Stack>
        </Stack>
      </div>
    </>
  );
}
