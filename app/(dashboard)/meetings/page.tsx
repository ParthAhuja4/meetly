import LoadingState from "@/components/ui/loading-state";
import { auth } from "@/lib/auth";
import { loadSearchParams } from "@/modules/agents/server/params";
import MeetingsListHeader from "@/modules/meetings/ui/components/meetings-list-header";
import MeetingsView from "@/modules/meetings/ui/views/meetings-veiw";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import type { SearchParams } from "nuqs/server";

interface Props {
  searchParams: Promise<SearchParams>;
}

export default async function Meetings({ searchParams }: Props) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/sign-in");
  }
  const filters = await loadSearchParams(searchParams);
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.meetings.getMany.queryOptions({ ...filters }),
  );
  return (
    <>
      <MeetingsListHeader />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense
          fallback={
            <LoadingState
              title="Loading Meetings"
              description="I gotchu twin, hang tight..."
            />
          }
        >
          <MeetingsView />
        </Suspense>
      </HydrationBoundary>
    </>
  );
}
