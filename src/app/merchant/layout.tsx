import UserDashboardLayout from "@/components/module/user-dashboard/UserDashboardLayout";

type Props = {
  children: React.ReactNode;
};

const layout = ({ children }: Props) => {
  return <UserDashboardLayout>{children}</UserDashboardLayout>;
};

export default layout;
