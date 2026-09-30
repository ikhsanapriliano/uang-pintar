"use client";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const ReactQueryDevtoolsDev = () => {
  if (process.env.NODE_ENV !== "development") return null;
  return <ReactQueryDevtools initialIsOpen={false} />;
};

export default ReactQueryDevtoolsDev;
