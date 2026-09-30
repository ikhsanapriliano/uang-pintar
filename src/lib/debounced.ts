import { useEffect, useState } from "react";

export const useDebounced = (inputValue: string) => {
  const [value, setValue] = useState<string>("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setValue(inputValue);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [inputValue]);

  return value;
};
