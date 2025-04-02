import { ComponentPropsWithoutRef } from "react";
import { DialogContent as ShadDialogContent } from "@/components/ui/dialog";

export function DialogContent(props: ComponentPropsWithoutRef<typeof ShadDialogContent>) {
  return (
    <ShadDialogContent
      className="bg-white text-zinc-900 border border-zinc-200 p-4"
      {...props}
    />
  );
}
