"use client";

import { useState, useEffect } from "react";
import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "use-debounce";
import { useMeetingsFilters } from "../../hooks/use-meetings-filters";

export default function MeetingsSearchFilter() {
  const [filters, setFilters] = useMeetingsFilters();
  const [localSearch, setLocalSearch] = useState(filters.search ?? "");
  const [debouncedSearch] = useDebounce(localSearch, 500);

  useEffect(() => {
    if (filters.search !== debouncedSearch) {
      setFilters({ search: debouncedSearch });
    }
  }, [debouncedSearch, setFilters, filters.search]);

  return (
    <div className="relative">
      <Input
        placeholder="Filter by Name"
        className="h-9 bg-white w-50 pl-7 focus-visible:ring-1"
        value={localSearch}
        onChange={(e) => setLocalSearch(e.target.value)}
      />
      <SearchIcon className="size-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}
