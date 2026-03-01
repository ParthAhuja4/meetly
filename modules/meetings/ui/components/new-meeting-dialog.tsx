import ResponsiveDialog from "@/components/ui/responsive-dialog";
import MeetingsForm from "./meetings-form";
import { useRouter } from "next/navigation";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
export default function NewMeetingDialog({ onOpenChange, open }: Props) {
  const router = useRouter();
  return (
    <ResponsiveDialog
      title="New Meeting"
      description="Create a New Meeting"
      open={open}
      onOpenChange={onOpenChange}
    >
      <MeetingsForm
        onSuccess={(id) => {
          onOpenChange(false);
          router.push(`/meetings/${id}`);
        }}
        onCancel={() => onOpenChange(false)}
      />
    </ResponsiveDialog>
  );
}
