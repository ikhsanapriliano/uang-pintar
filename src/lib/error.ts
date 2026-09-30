import type { TResponse } from "@/server/api/types/global-type";
import { TRPCError } from "@trpc/server";
import type { AxiosError } from "axios";

export const handleTRPCError = (error: AxiosError | unknown) => {
  const errData = (error as AxiosError<TResponse<any>>).response?.data.meta;
  if (errData) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: errData.message,
    });
  }

  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "internal server error",
  });
};
