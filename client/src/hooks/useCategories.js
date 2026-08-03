import { useCallback, useEffect, useState } from "react";
import { apiListCategories } from "../services/category.service";

export function useCategories(type) {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await apiListCategories(type);
      setCategories(list);
    } finally {
      setIsLoading(false);
    }
  }, [type]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { categories, isLoading, reload };
}
