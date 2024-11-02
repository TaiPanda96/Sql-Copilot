import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/dist/types/server";

export async function useUserHook() {
  const { isAuthenticated, getUser } = getKindeServerSession();
  return {
    isAuthenticated,
    userKinde: getUser(),
  };
}
