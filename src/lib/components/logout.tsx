import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";

export function Logout() {
  return (
    <div className="absolute top-4 right-4 px-4 py-2">
      <LogoutLink>Log out</LogoutLink>
    </div>
  );
}
