import { parseAsInteger } from "nuqs";

export const paginationSearchParams = {
  page: parseAsInteger,
  limit: parseAsInteger,
};
