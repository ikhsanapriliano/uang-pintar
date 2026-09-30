import { redirect } from "next/navigation";
import ChangePasswordForm from "@/components/module/auth/user/ChangePasswordForm";

type Props = {
  searchParams: Promise<{ code?: string; user_id?: string }>;
};

const page = async ({ searchParams }: Props) => {
  const { code, user_id } = await searchParams;
  if (!code || !user_id) redirect("/login");
  return <ChangePasswordForm code={code} user_id={user_id} />;
};

export default page;
