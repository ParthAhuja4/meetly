"use client";

import { useTRPC } from "@/trpc/client";
import {
  Call,
  CallingState,
  StreamCall,
  StreamVideo,
  StreamVideoClient,
} from "@stream-io/video-react-sdk";
import { useMutation } from "@tanstack/react-query";
import { LoaderIcon } from "lucide-react";
import { useEffect, useState } from "react";
import CallUI from "./call-ui";
import "@stream-io/video-react-sdk/dist/css/styles.css";

interface Props {
  meetingId: string;
  meetingName: string;
  userId: string;
  userName: string;
  userImage: string;
}

export const CallConnect = ({
  meetingId,
  meetingName,
  userName,
  userId,
  userImage,
}: Props) => {
  const trpc = useTRPC();
  const { mutateAsync: generateToken } = useMutation(
    trpc.meetings.generateToken.mutationOptions(),
  );
  const [client, setClient] = useState<StreamVideoClient | undefined>();

  useEffect(() => {
    let _client: StreamVideoClient;
    const fn = () => {
      _client = new StreamVideoClient({
        apiKey: process.env.NEXT_PUBLIC_STREAM_VIDEO_API_KEY!,
        user: {
          id: userId,
          name: userName,
          image: userImage,
        },
        tokenProvider: generateToken,
      });
      setClient(_client);
    };
    fn();

    return () => {
      _client?.disconnectUser();
      setClient(undefined);
    };
  }, [generateToken, userId, userImage, userName]);

  const [call, setCall] = useState<Call | undefined>();

  useEffect(() => {
    if (!client) return;
    let _call: Call;
    const fn = () => {
      _call = client.call("default", meetingId);
      _call.camera.disable();
      _call.microphone.disable();
      setCall(_call);
    };
    fn();

    return () => {
      if (_call.state.callingState !== CallingState.LEFT) {
        _call.leave();
        _call.endCall();
        setCall(undefined);
      }
    };
  }, [client, meetingId]);

  if (!client || !call) {
    return (
      <div className="flex h-screen items-center justify-center bg-radial from-sidebar-accent to-sidebar">
        <LoaderIcon className="size-6 animate-spin text-white" />
      </div>
    );
  }

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <CallUI meetingName={meetingName} />
      </StreamCall>
    </StreamVideo>
  );
};
