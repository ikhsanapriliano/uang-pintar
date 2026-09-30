import { useSession } from "next-auth/react";

// Client Side
export const getUserId = (): string => {
  const session = useSession();
  return session.data?.user.userId ?? "";
};

export const getRole = (): string => {
  const session = useSession();
  return session.data?.user.role ?? "";
};

export const getAccessToken = (): string => {
  const session = useSession();
  return session.data?.user.accessToken ?? "";
};
