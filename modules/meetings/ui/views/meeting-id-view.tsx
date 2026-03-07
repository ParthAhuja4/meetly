"use client";

import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import MeetingIdViewHeader from "../components/meeting-id-header";
import { useRouter } from "next/navigation";
import UpdateMeetingDialog from "../components/update-meeting-dialog";
import { useState } from "react";
import EmptyState from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { VideoIcon } from "lucide-react";
import Link from "next/link";
import CompletedState from "@/modules/meetings/ui/components/completed-state";

interface Props {
  meetingId: string;
}

export default function MeetingIdView({ meetingId }: Props) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [dialog, setDialog] = useState<boolean>(false);
  const { data } = useSuspenseQuery(
    trpc.meetings.getOne.queryOptions({ id: meetingId }),
  );

  const isActive = data.status === "active";
  const isUpcoming = data.status === "upcoming";
  const isCancelled = data.status === "cancelled";
  const isCompleted = data.status === "completed";
  const isProcessing = data.status === "processing";

  const removeMeeting = useMutation(
    trpc.meetings.remove.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.meetings.getMany.queryOptions({}),
        );
        await queryClient.invalidateQueries(
          trpc.premium.getFreeUsage.queryOptions(),
        );
        router.push("/meetings");
      },
    }),
  );

  return (
    <>
      <UpdateMeetingDialog
        open={dialog}
        onOpenChange={setDialog}
        initialValue={data}
      />
      <div className="flex-1 py-4 px-4 md:px-8 flex flex-col gap-y-4">
        <MeetingIdViewHeader
          meetingId={meetingId}
          meetingName={data.name}
          onEdit={() => {
            setDialog(true);
          }}
          onRemove={async () => {
            await removeMeeting.mutateAsync({ id: meetingId });
          }}
        />
        {isCancelled && (
          <div className="bg-white rounded-lg px-4 py-5 flex flex-col gap-y-8 items-center justify-center">
            <EmptyState
              image="/cancelled.svg"
              title="Meeting Cancelled"
              description="Meeting was Cancelled"
            />
          </div>
        )}
        {isProcessing && (
          <div className="bg-white rounded-lg px-4 py-5 flex flex-col gap-y-8 items-center justify-center">
            <EmptyState
              image="/cancelled.svg"
              title="Meeting Completed"
              description="Meeting was Completed, a summary will appear soon."
            />
          </div>
        )}
        {isCompleted && <CompletedState data={data} />}
        {isActive && (
          <div className="bg-white rounded-lg px-4 py-5 flex flex-col gap-y-8 items-center justify-center">
            <EmptyState
              image="/upcoming.svg"
              title="Meeting Is Active"
              description="Meeting will end once all participant have left."
            />
            <div className="flex flex-col-reverse lg:flex-row lg:justify-center items-center gap-2 w-full">
              <Button asChild className="w-full lg:w-auto">
                <Link href={`/call/${meetingId}`}>
                  <VideoIcon />
                  Join Meeting
                </Link>
              </Button>
            </div>
          </div>
        )}
        {isUpcoming && (
          <div className="bg-white rounded-lg px-4 py-5 flex flex-col gap-y-8 items-center justify-center">
            <EmptyState
              image="/upcoming.svg"
              title="Not started yet"
              description="Once you start this meeting, a summary will appear here"
            />
            <div className="flex flex-col-reverse lg:flex-row lg:justify-center items-center gap-2 w-full">
              <Button disabled={false} asChild className="w-full lg:w-auto">
                <Link href={`/call/${meetingId}`}>
                  <VideoIcon />
                  Start Meeting
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
