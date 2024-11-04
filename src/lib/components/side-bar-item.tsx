import Link from "next/link";
import { Text } from "./text";

interface SideBarNavigationItemProps {
  href: string;
  label: string;
}

export default function SideBarItem({
  href,
  label,
}: SideBarNavigationItemProps) {
  return (
    <Link href={href}>
      <Text value={label} size="md" color="light" />
    </Link>
  );
}
