import { redirect } from "next/navigation";
import VerifyRegisterForm from "@/components/module/auth/user/VerifyRegisterForm";

type Props = {
  searchParams: Promise<{ email?: string }>;
};

const page = async ({ searchParams }: Props) => {
  const { email } = await searchParams;
  if (!email) redirect("/login");
  return <VerifyRegisterForm email={email} />;
};

export default page;
