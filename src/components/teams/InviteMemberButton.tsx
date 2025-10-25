import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { InviteMemberModal } from "./InviteMemberModal";

interface InviteMemberButtonProps {
  teamId: string;
  teamName: string;
}

export const InviteMemberButton = ({ teamId, teamName }: InviteMemberButtonProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <UserPlus className="w-4 h-4 mr-2" />
        Invite Member
      </Button>
      <InviteMemberModal
        open={open}
        onOpenChange={setOpen}
        teamId={teamId}
        teamName={teamName}
      />
    </>
  );
};