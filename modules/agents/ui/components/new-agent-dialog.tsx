import ResponsiveDialog from "@/components/ui/responsive-dialog";
import AgentForm from "@/modules/agents/ui/components/agent-form";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
export default function NewAgentDialog({ onOpenChange, open }: Props) {
  return (
    <ResponsiveDialog
      title="New Agent"
      description="Create a New Agent"
      open={open}
      onOpenChange={onOpenChange}
    >
      <AgentForm
        onSuccess={() => onOpenChange(false)}
        onCancel={() => onOpenChange(false)}
      />
    </ResponsiveDialog>
  );
}
