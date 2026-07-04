export default function RootLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary-500" />
        <p className="text-sm text-text-secondary">Loading...</p>
      </div>
    </div>
  );
}
