import { useDroppable } from "@dnd-kit/core";

export function Column({
  children,
  id,
  name,
  tasksCount,
}: {
  children: React.ReactNode;
  id: number;
  name: string;
  tasksCount: number;
}) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className="w-[320px] shrink-0 rounded-xl border border-indigo-200 dark:border-indigo-500/30 bg-white/70 dark:bg-indigo-950/30 backdrop-blur p-4 shadow-sm"
    >
      {/* Column header */}
      <div className="sticky top-0 bg-transparent z-10 -mx-4 px-4 pb-3 flex items-center justify-between">
        <h2 className="font-medium tracking-tight">{name}</h2>
        <span className="text-xs rounded-full px-2 py-0.5 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-200">
          {tasksCount}
        </span>
      </div>
      {children}
    </div>
  );
}
