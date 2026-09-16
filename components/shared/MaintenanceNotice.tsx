import { Wrench } from "@/components/ui/icons";

const FALLBACK_TITLE = "We'll be back shortly";
const FALLBACK_MESSAGE =
  "Our site is currently undergoing scheduled maintenance. Thank you for your patience and understanding.";
const THANKS_LINE = "Thank you for your patience and understanding.";

export default function MaintenanceNotice({
  title,
  message,
}: {
  title?: string | null;
  message?: string | null;
}) {
  const heading = title?.trim() ? title.trim() : FALLBACK_TITLE;
  const body = message?.trim() ? message.trim() : FALLBACK_MESSAGE;
  const showThanks = !body.toLowerCase().includes("thank you");

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <p className="font-heading text-lg font-bold tracking-tight text-primary">
        All Property <span className="text-accent-300">Link</span>
      </p>
      <div className="mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-600">
        <Wrench size={28} />
      </div>
      <h1 className="mt-6 mb-2 font-heading text-3xl font-bold text-text-primary">{heading}</h1>
      <p className="mb-2 text-text-secondary">{body}</p>
      {showThanks && <p className="mb-8 text-sm text-text-secondary">{THANKS_LINE}</p>}
      {!showThanks && <div className="mb-8" />}
      <p className="text-sm font-medium text-text-secondary">All Property Link</p>
    </div>
  );
}
