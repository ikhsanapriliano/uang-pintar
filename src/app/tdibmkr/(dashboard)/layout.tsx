import AdminDashboardLayout from "@/components/module/admin/AdminDashboardLayout";

type Props = {
  children: React.ReactNode;
};

const layout = ({ children }: Props) => {
  return <AdminDashboardLayout>{children}</AdminDashboardLayout>;
};

export default layout;
