"use client";

import { useState, type ReactElement } from "react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ConfirmDialogProps {
  trigger: ReactElement;
  title: string;
  description: string | ReactElement;
  confirmLabel?: string;
  confirmVariant?: "destructive" | "default";
  onConfirm?: () => void;
  requiresInput?: boolean;
  inputLabel?: string;
  inputPlaceholder?: string;
  inputType?: string;
  onConfirmWithInput?: (input: string) => void;
}

export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "Confirm",
  confirmVariant = "default",
  onConfirm,
  requiresInput,
  inputLabel = "Type to confirm",
  inputPlaceholder = "",
  inputType = "text",
  onConfirmWithInput,
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  function handleConfirm() {
    setOpen(false);
    if (requiresInput && onConfirmWithInput) {
      onConfirmWithInput(inputValue);
      setInputValue("");
    } else if (onConfirm) {
      onConfirm();
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setInputValue(""); }}>
      <AlertDialogTrigger render={trigger} />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {requiresInput && (
          <div className="space-y-2 px-6">
            <Label htmlFor="confirm-input">{inputLabel}</Label>
            <Input
              id="confirm-input"
              type={inputType}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={inputPlaceholder}
              autoFocus
            />
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant={confirmVariant === "destructive" ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={requiresInput && !inputValue.trim()}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
