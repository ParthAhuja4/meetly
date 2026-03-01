import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { useMeetingsFilters } from "../../hooks/use-meetings-filters";
import CommandSelect from "./command-select";
import GeneratedAvatar from "@/components/ui/generated-avatar";
import { useDebounce } from "use-debounce";

export const AgentIdFilter = () => {
  const [filters, setFilters] = useMeetingsFilters();
  const trpc = useTRPC();
  const [agentSearch, setAgentSearch] = useState("");
  const [debouncedSearch] = useDebounce(agentSearch, 500);
  const { data } = useQuery({
    ...trpc.agents.getMany.queryOptions({
      pageSize: 100,
      search: debouncedSearch,
    }),
    placeholderData: keepPreviousData,
  });
  return (
    <CommandSelect
      className="h-9"
      placeholder="Agent"
      value={filters.agentId ?? ""}
      onSelect={(value) => setFilters({ agentId: value })}
      onSearch={setAgentSearch}
      options={(data?.items ?? []).map((agent) => ({
        id: agent.id,
        value: agent.id,
        children: (
          <div className="flex items-center gap-x-2">
            <GeneratedAvatar
              seed={agent.name}
              variant="botttsNeutral"
              className="size-4"
            />
            {agent.name}
          </div>
        ),
      }))}
    />
  );
};
