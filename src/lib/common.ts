import { type TFilterState } from "@/store/filter-store";

export function handleSelectFilterCount(
  filterType: string,
  value: string | number | null,
  filter: TFilterState,
) {
  if (!value || value == "all") {
    filter.decrement(filterType);
  } else if (!filter.active.includes(filterType)) {
    filter.increment(filterType);
  }
}

export function generatePageArray(
  totalPage: number,
  currentPage: number,
): string[] {
  const result: string[] = [];

  if (totalPage == 0) {
    return result;
  }

  const max = 2;
  let firstNumber = currentPage;
  let lastNumber = max + currentPage;

  if (totalPage <= 3) {
    firstNumber = 1;
    lastNumber = totalPage;
  } else {
    if (totalPage - currentPage == 1) {
      firstNumber = currentPage - 1;
      lastNumber = totalPage;
    }

    if (totalPage - currentPage == 0 && totalPage >= 3) {
      firstNumber = currentPage - 2;
      lastNumber = totalPage;
    }
  }

  for (let i = firstNumber; i <= lastNumber; i++) {
    result.push(i.toString());
  }

  if (totalPage > 3) {
    if (currentPage != 1) {
      result.unshift("...");
    }

    if (currentPage != totalPage && lastNumber != totalPage) {
      result.push("...");
    }
  }

  return result;
}

export function filterSelectedData(data: any[], selectedRows: string[]): any[] {
  return data.filter((item) => selectedRows.includes(item.id));
}
