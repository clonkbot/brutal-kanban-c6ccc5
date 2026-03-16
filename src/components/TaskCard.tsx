import { Id } from "../../convex/_generated/dataModel";

export interface Task {
  _id: Id<"tasks">;
  title: string;
  description?: string;
  columnId: Id<"columns">;
  boardId: Id<"boards">;
  userId: Id<"users">;
  order: number;
  priority?: "low" | "medium" | "high";
  createdAt: number;
}

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onDragStart: () => void;
  isDragging: boolean;
}

const priorityColors: Record<"low" | "medium" | "high", string> = {
  high: "bg-[#FF3B30]",
  medium: "bg-[#FF9500]",
  low: "bg-[#34C759]",
};

const priorityLabels: Record<"low" | "medium" | "high", string> = {
  high: "HIGH",
  medium: "MED",
  low: "LOW",
};

export function TaskCard({ task, onEdit, onDragStart, isDragging }: TaskCardProps) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onEdit}
      className={`border-3 border-black p-3 bg-white cursor-grab active:cursor-grabbing hover:bg-[#FFEB3B] transition-all group shadow-[3px_3px_0_0_#000] hover:shadow-[4px_4px_0_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 ${
        isDragging ? "opacity-50 rotate-2 scale-105" : ""
      }`}
      style={{ borderWidth: '3px' }}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-mono text-xs md:text-sm font-bold tracking-tight uppercase leading-tight break-words flex-1">
          {task.title}
        </h3>
        {task.priority && (
          <span className={`${priorityColors[task.priority]} text-white font-mono text-[10px] font-bold px-1.5 py-0.5 flex-shrink-0`}>
            {priorityLabels[task.priority]}
          </span>
        )}
      </div>

      {task.description && (
        <p className="font-mono text-[10px] md:text-xs text-black/60 mt-2 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      <div className="flex items-center gap-2 mt-3 pt-2 border-t-2 border-black/10">
        <div className="w-1.5 h-1.5 bg-[#FF3B30]" />
        <span className="font-mono text-[10px] text-black/40 uppercase">
          {new Date(task.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}
