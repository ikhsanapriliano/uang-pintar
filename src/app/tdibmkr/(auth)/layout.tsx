import AuthAdminLayout from "@/components/module/auth/admin/AuthAdminLayout";

type Props = {
  children: React.ReactNode;
};

const layout = ({ children }: Props) => {
  return <AuthAdminLayout>{children}</AuthAdminLayout>;
};

export default layout;
