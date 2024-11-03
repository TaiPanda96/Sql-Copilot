import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Stack } from "./stack";

interface Breadcrumb {
  href: string;
  label: string;
}

interface SidebarProps {
  breadcrumbs: Breadcrumb[];
}

export default function SidebarNav({ breadcrumbs }: SidebarProps) {
  const router = useRouter();

  return (
    <div className="w-64 bg-gray-800 text-white h-full p-4">
      <h2 className="text-lg font-semibold mb-4">SQL Copilot</h2>
      <nav>
        <Stack gap={4}>
          <ul>
            {breadcrumbs.map((breadcrumb, index) => (
              <li key={index} className="mb-2">
                <SideBarNavigationItem
                  href={breadcrumb.href}
                  label={breadcrumb.label}
                  router={router}
                />
              </li>
            ))}
          </ul>
        </Stack>
      </nav>
    </div>
  );
}

interface SideBarNavigationItemProps {
  href: string;
  label: string;
  router: AppRouterInstance;
}
function SideBarNavigationItem({
  href,
  label,
  router,
}: SideBarNavigationItemProps) {
  return (
    <li className="mb-2">
      <Link href={href}>
        <a
          className="hover:underline hover:text-blue-400 transition duration-150"
          onClick={() => router.push(href)}
        >
          {label}
        </a>
      </Link>
    </li>
  );
}
