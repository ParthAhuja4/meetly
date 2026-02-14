"use client";

import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import AgentIdViewHeader from "../components/agent-id-header";
import GeneratedAvatar from "@/components/ui/generated-avatar";
import { Badge } from "@/components/ui/badge";
import { VideoIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import UpdateAgentDialog from "../components/update-agent-dialog";

interface Props {
  agentId: string;
}

export default function AgentIdView({ agentId }: Props) {
  const [dialog, setDialog] = useState<boolean>(false);
  const trpc = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();
  const removeAgent = useMutation(
    trpc.agents.remove.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.agents.getMany.queryOptions({}),
        );
        router.push("/agents");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const { data } = useSuspenseQuery(
    trpc.agents.getOne.queryOptions({ id: agentId }),
  );
  return (
    <>
      <UpdateAgentDialog
        open={dialog}
        onOpenChange={setDialog}
        initialValues={data}
      />
      <div className="flex-1 py-4 px-4 md:px-8 flex flex-col gap-y-4">
        <AgentIdViewHeader
          agentId={agentId}
          agentName={data.name}
          onEdit={() => setDialog(true)}
          onRemove={() => removeAgent.mutate({ id: agentId })}
        />
        <div className="bg-white rounded-lg border">
          <div className="px-4 py-5 gap-y-5 flex flex-col col-span-3">
            <div className="flex items-center gap-x-3">
              <GeneratedAvatar
                className="size-10"
                seed={data.name}
                variant="botttsNeutral"
              />
              <h2 className="text-2xl font-medium">{data.name}</h2>
            </div>
            <Badge
              variant="outline"
              className="flex items-center gap-x-2 [&>svg]:size-4"
            >
              <VideoIcon className="text-blue-700" />5
            </Badge>
            <div className="flex flex-col gap-y-4">
              <p className="text-lg font-medium">Instructions</p>
              <p className="text-neutral-800">{data.instructions}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
