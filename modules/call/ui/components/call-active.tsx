import Link from "next/link";
import Image from "next/image";
import { CallControls, SpeakerLayout } from "@stream-io/video-react-sdk";
import { toast } from "sonner";
import { useEffect } from "react";

interface Props {
  onLeave: () => void;
  meetingName: string;
}

export const CallActive = ({ onLeave, meetingName }: Props) => {
  useEffect(() => {
    toast.success(
      "If no agents join, API credits are depleted, the app is working normally.",
      { id: "credits" },
    );
  }, []);
  return (
    <div className="flex h-screen flex-col bg-black text-white">
      <div className="flex items-center gap-4 p-4">
        <Link
          href="/"
          className="flex items-center justify-center rounded-full bg-white/10 p-2"
        >
          <Image src="/logo.svg" width={22} height={22} alt="Logo" />
        </Link>
        <h4 className="text-base font-medium truncate">{meetingName}</h4>
      </div>

      <div className="flex-1 px-4 pb-4">
        <div className="h-full w-full overflow-hidden rounded-2xl bg-[#101213]">
          <SpeakerLayout />
        </div>
      </div>

      <div className="border-t border-white/10 bg-[#101213] p-4">
        <CallControls onLeave={onLeave} />
      </div>
    </div>
  );
};
