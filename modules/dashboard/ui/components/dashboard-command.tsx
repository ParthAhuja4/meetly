"use client";
import { CommandDialog, CommandInput } from "@/components/ui/command";
import { CommandItem, CommandList } from "cmdk";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

interface Props {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export default function DashboardCommand({ open, setOpen }: Props) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const change = () => setIsMounted(true);
    change();
  }, []);

  if (!isMounted) {
    return null;
  }
  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Find a meeting or agent" />
      <CommandList>
        <CommandItem></CommandItem>
      </CommandList>
    </CommandDialog>
  );
}
