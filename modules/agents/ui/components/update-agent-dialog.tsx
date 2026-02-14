import ResponsiveDialog from "@/components/ui/responsive-dialog";
import AgentForm from "@/modules/agents/ui/components/agent-form";
import { AgentGetOneResponse } from "../../types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues: AgentGetOneResponse;
}
export default function UpdateAgentDialog({
  onOpenChange,
  open,
  initialValues,
}: Props) {
  return (
    <ResponsiveDialog
      title="Edit Agent"
      description="Edit Agent Details"
      open={open}
      onOpenChange={onOpenChange}
    >
      <AgentForm
        onSuccess={() => onOpenChange(false)}
        onCancel={() => onOpenChange(false)}
        initialValues={initialValues}
      />
    </ResponsiveDialog>
  );
}
