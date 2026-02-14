import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";
import AgentIdView from "@/modules/agents/ui/views/agent-id-view";
import LoadingState from "@/components/ui/loading-state";
import ErrorState from "@/components/ui/error-state";

interface Props {
  params: Promise<{ agentId: string }>;
}

export default async function Page({ params }: Props) {
  const { agentId } = await params;
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.agents.getOne.queryOptions({ id: agentId }),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense
        fallback={
          <LoadingState
            title="Loading Agent"
            description="I gotchu twin, hang tight..."
          />
        }
      >
        <ErrorBoundary
          fallback={
            <ErrorState
              title="Error Loading Agent"
              description="Try Again Later"
            />
          }
        />
        <AgentIdView agentId={agentId} />
      </Suspense>
    </HydrationBoundary>
  );
}
