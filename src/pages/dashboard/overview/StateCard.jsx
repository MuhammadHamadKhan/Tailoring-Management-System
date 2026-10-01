export default function StatCard({ title, isLoading, value, icon: Icon }) {
  return (
    <div
      className="
        rounded-2xl border border-border bg-surface
        p-5 sm:p-6
        shadow-sm
        transition-shadow duration-200
        hover:shadow-md
      "
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-muted">{title}</p>

          <h3 className="mt-2 text-2xl font-bold tracking-tight text-heading sm:text-3xl">
            {isLoading ? (
              <span className="animate-ping ease-in-out ">...</span>
            ) : (
              value
            )}
          </h3>
        </div>

        <div
          className="
            flex h-11 w-11 shrink-0 items-center justify-center
            rounded-xl bg-amber-50 text-primary
          "
        >
          <Icon size={21} strokeWidth={2} />
        </div>
      </div>
    </div>
  );
}
