import ResponsiveDialog from "@/components/ui/responsive-dialog";
import MeetingsForm from "./meetings-form";
import { MeetingGetOneResponse } from "../../types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValue: MeetingGetOneResponse;
}
export default function UpdateMeetingDialog({
  onOpenChange,
  open,
  initialValue,
}: Props) {
  return (
    <ResponsiveDialog
      title="Update Meeting"
      description="Edit the Meeting"
      open={open}
      onOpenChange={onOpenChange}
    >
      <MeetingsForm
        onSuccess={() => {
          onOpenChange(false);
        }}
        onCancel={() => onOpenChange(false)}
        initialValues={initialValue}
      />
    </ResponsiveDialog>
  );
}
