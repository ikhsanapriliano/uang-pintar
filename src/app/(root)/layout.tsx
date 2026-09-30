import LandingPageLayout from "@/components/module/landing-page/LandingPageLayout";

type Props = {
  children: React.ReactNode;
};

const layout = ({ children }: Props) => {
  return <LandingPageLayout>{children}</LandingPageLayout>;
};

export default layout;
