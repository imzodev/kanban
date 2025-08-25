import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

export function TaskCard({
  children,
  id,
  isDragging = false,
}: {
  children: React.ReactNode;
  id: number;
  isDragging?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="group rounded-lg bg-white/70 dark:bg-indigo-900/95 border border-indigo-200 dark:border-indigo-500/30 backdrop-blur p-3 shadow-sm hover:shadow-md transition"
    >
      {children}
    </div>
  );
}
