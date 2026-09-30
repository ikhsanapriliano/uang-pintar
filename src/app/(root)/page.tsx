import type { Metadata } from "next";
import LandingPageContainer from "@/components/module/landing-page/LandingPageContainer";

export const metadata: Metadata = {
  robots: {
    index: true,
    follow: true,
  },
};

const page = () => {
  return <LandingPageContainer />;
};

export default page;
