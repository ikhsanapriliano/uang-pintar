import LandingPageHeader from "./LandingPageHeader";
import LandingPageFooter from "./LandingPageFooter";

type Props = {
  children: React.ReactNode;
};

const LandingPageLayout = ({ children }: Props) => {
  return (
    <div className="bg-white">
      <LandingPageHeader />
      <main className="flex-1">{children}</main>
      <LandingPageFooter />
    </div>
  );
};

export default LandingPageLayout;
