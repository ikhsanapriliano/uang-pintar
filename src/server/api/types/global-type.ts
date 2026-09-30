export type TErrorMessage = {
  field: string;
  message: string;
};

export type TMetaData = {
  status: number;
  message: string;
  error?: string;
  location?: string;
};

export type TResponse<T> = {
  meta: TMetaData;
  data: T;
};

export type TPaginationParams = {
  page?: number | null;
  limit?: number | null;
};

export type TPagination = {
  page: number;
  limit: number;
  total_page: number;
  total_item: number;
};

export type TBaseApiPayload = TPaginationParams & {
  bearerToken?: any;
};

export type TDeleteBatchPayload = {
  ids: string[];
};

export type TMailTemplate = {
  subject: string;
  html: string;
};
