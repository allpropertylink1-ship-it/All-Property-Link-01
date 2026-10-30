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
import { Eye, EyeOff, Loader2 } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  trigger: ReactElement;
  title: string;
  description: string | ReactElement;
  confirmLabel?: string;
  confirmVariant?: "destructive" | "default";
  onConfirm?: () => void;
  requiresInput?: boolean;
  requiredInputValue?: string;
  inputLabel?: string;
  inputPlaceholder?: string;
  inputType?: string;
  onConfirmWithInput?: (input: string, password?: string) => void;
  requiresPassword?: boolean;
  passwordLabel?: string;
  passwordPlaceholder?: string;
  isLoading?: boolean;
  error?: string | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "Confirm",
  confirmVariant = "default",
  onConfirm,
  requiresInput,
  requiredInputValue,
  inputLabel = "Type to confirm",
  inputPlaceholder = "",
  inputType = "text",
  onConfirmWithInput,
  requiresPassword = false,
  passwordLabel = "Current password",
  isLoading = false,
  error,
  open: openProp,
  onOpenChange,
}: ConfirmDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const isControlled = openProp !== undefined;
  const dialogOpen = isControlled ? openProp! : internalOpen;

  function setDialogOpen(val: boolean) {
    if (!isControlled) setInternalOpen(val);
    onOpenChange?.(val);
  }

  function handleConfirm() {
    if (requiresInput && onConfirmWithInput) {
      onConfirmWithInput(inputValue, requiresPassword ? passwordValue : undefined);
      setInputValue("");
      setPasswordValue("");
      if (!isControlled) setDialogOpen(false);
      return;
    }
    if (onConfirm) onConfirm();
    setDialogOpen(false);
  }

  const isInputInvalid = requiresInput && requiredInputValue && inputValue !== requiredInputValue;
  const isPasswordInvalid = requiresPassword && !passwordValue.trim();

  return (
    <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <AlertDialogTrigger render={trigger} />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2 px-6">
          {requiresInput && (
            <>
              <Label htmlFor="confirm-input">{inputLabel}</Label>
              <Input
                id="confirm-input"
                type={inputType}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={inputPlaceholder}
                autoFocus
                aria-invalid={isInputInvalid || error ? true : undefined}
                aria-describedby={(error || isInputInvalid || isPasswordInvalid) ? "confirm-input-error" : undefined}
                className={cn(
                  "border-border",
                  isInputInvalid || error ? "border-error-500" : undefined,
                )}
              />
              {requiresInput && requiredInputValue && !isInputInvalid && !error && (
                <p className="text-xs text-success-600" role="status">
                  Matches "{requiredInputValue}"
                </p>
              )}
              {requiresInput && requiredInputValue && isInputInvalid && !error && (
                <p className="text-xs text-error-600" role="alert">
                  Does not match "{requiredInputValue}" (case-sensitive)
                </p>
              )}
            </>
          )}
          {requiresPassword && (
            <>
              <div className="flex items-center gap-2">
                <Label htmlFor="confirm-password">{passwordLabel}</Label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="ml-auto p-1 text-text-secondary hover:text-text-primary"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <Input
                id="confirm-password"
                type={showPassword ? "text" : "password"}
                value={passwordValue}
                onChange={(e) => setPasswordValue(e.target.value)}
                placeholder="Enter your current password"
                autoComplete="current-password"
                aria-invalid={isPasswordInvalid || error ? true : undefined}
                aria-describedby={(error || isInputInvalid || isPasswordInvalid) ? "confirm-input-error" : undefined}
                className={cn(
                  "border-border",
                  isPasswordInvalid || error ? "border-error-500" : undefined,
                )}
              />
            </>
          )}
          {(error || isInputInvalid || isPasswordInvalid) && (
            <p id="confirm-input-error" className="text-xs text-error-600" role="alert">
              {error ||
                (isInputInvalid
                  ? `Please type "${requiredInputValue}" exactly to confirm (case-sensitive).`
                  : isPasswordInvalid
                    ? "Please enter your current password."
                    : "")}
            </p>
          )}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => { setDialogOpen(false); }}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            variant={confirmVariant === "destructive" ? "destructive" : "primary"}
            onClick={handleConfirm}
            disabled={
              isLoading ||
              (requiresInput && requiredInputValue ? inputValue !== requiredInputValue : false) ||
              (requiresPassword && !passwordValue.trim())
            }
          >
            {isLoading ? (
              <>
                <Loader2 size={14} className="mr-2 animate-spin" />
                Deleting…
              </>
            ) : (
              confirmLabel
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
