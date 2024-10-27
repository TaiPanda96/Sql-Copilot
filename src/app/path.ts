import { redirect } from "next/navigation";

export function getChatPath() {
  return redirect("/chat");
}
