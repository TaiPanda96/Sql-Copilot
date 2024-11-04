import Link from "next/link";
import { Text } from "./text";

interface SideBarNavigationItemProps {
  href: string;
  label: string;
  readOnly?: boolean;
}

export default function SideBarItem({
  href,
  label,
  readOnly,
}: SideBarNavigationItemProps) {
  return readOnly ? (
    <Text value={label} size="md" color="light" />
  ) : (
    <Link href={href}>
      <Text value={label} size="md" color="light" />
    </Link>
  );
}
