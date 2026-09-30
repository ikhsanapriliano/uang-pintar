import { parseAsString, useQueryStates } from "nuqs";
import { paginationSearchParams } from "./pagination-search-params";

const userSearchParams = {
  ...paginationSearchParams,
  first_name: parseAsString,
  role_id: parseAsString,
  warehouse_id: parseAsString,
};

export const useUserSearchParams = () => {
  const [searchParams, setSearchParams] = useQueryStates(userSearchParams);

  return { searchParams, setSearchParams };
};
