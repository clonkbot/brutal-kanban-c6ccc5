import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";
import { TaskCard, Task } from "./TaskCard";
import { TaskModal } from "./TaskModal";

interface KanbanBoardProps {
  boardId: Id<"boards">;
  onBack: () => void;
}

interface Board {
  _id: Id<"boards">;
  name: string;
  createdAt: number;
}

interface Column {
  _id: Id<"columns">;
  name: string;
  order: number;
}

export function KanbanBoard({ boardId, onBack }: KanbanBoardProps) {
  const board = useQuery(api.boards.get, { id: boardId }) as Board | null | undefined;
  const columns = useQuery(api.columns.listByBoard, { boardId }) as Column[] | undefined;
  const tasks = useQuery(api.tasks.listByBoard, { boardId }) as Task[] | undefined;
  const createTask = useMutation(api.tasks.create);
  const moveTask = useMutation(api.tasks.move);
  const createColumn = useMutation(api.columns.create);

  const [addingToColumn, setAddingToColumn] = useState<Id<"columns"> | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [editingTask, setEditingTask] = useState<Id<"tasks"> | null>(null);
  const [draggedTask, setDraggedTask] = useState<Id<"tasks"> | null>(null);

  if (board === undefined || columns === undefined || tasks === undefined) {
    return (
      <div className="p-4 md:p-6 h-full">
        <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-shrink-0 w-72 md:w-80 border-4 border-black bg-white h-96 animate-pulse shadow-[6px_6px_0_0_#000]" />
          ))}
        </div>
      </div>
    );
  }

  if (board === null) {
    return (
      <div className="p-4 md:p-8 text-center">
        <p className="font-mono text-lg">BOARD NOT FOUND</p>
        <button onClick={onBack} className="mt-4 font-mono underline">GO BACK</button>
      </div>
    );
  }

  const handleAddTask = async (columnId: Id<"columns">) => {
    if (!newTaskTitle.trim()) return;
    await createTask({
      title: newTaskTitle.toUpperCase(),
      columnId,
      boardId,
    });
    setNewTaskTitle("");
    setAddingToColumn(null);
  };

  const handleAddColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColumnName.trim()) return;
    await createColumn({ boardId, name: newColumnName.toUpperCase() });
    setNewColumnName("");
    setIsAddingColumn(false);
  };

  const handleDragStart = (taskId: Id<"tasks">) => {
    setDraggedTask(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (columnId: Id<"columns">) => {
    if (!draggedTask) return;
    const columnTasks = tasks.filter((t: Task) => t.columnId === columnId);
    await moveTask({
      id: draggedTask,
      columnId,
      order: columnTasks.length,
    });
    setDraggedTask(null);
  };

  const getColumnTasks = (columnId: Id<"columns">): Task[] => {
    return tasks.filter((t: Task) => t.columnId === columnId).sort((a: Task, b: Task) => a.order - b.order);
  };

  const selectedTask = editingTask ? tasks.find((t: Task) => t._id === editingTask) : null;

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 md:px-6 py-4 border-b-4 border-black bg-white flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <button
            onClick={onBack}
            className="self-start bg-black text-white font-mono font-bold px-3 py-2 text-xs uppercase tracking-wider hover:bg-[#FF3B30] transition-colors"
          >
            &larr; BACK
          </button>
          <h1 className="font-mono text-xl md:text-3xl font-bold tracking-tight uppercase break-words">
            {board.name}
          </h1>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-4 md:gap-6 p-4 md:p-6 h-full min-w-max">
          {columns.map((column: Column) => (
            <div
              key={column._id}
              className="flex-shrink-0 w-72 md:w-80 flex flex-col bg-white border-4 border-black shadow-[6px_6px_0_0_#000]"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(column._id)}
            >
              <div className="p-3 md:p-4 border-b-4 border-black bg-[#F5F5F0] flex-shrink-0">
                <div className="flex items-center justify-between">
                  <h2 className="font-mono text-sm md:text-base font-bold tracking-tight uppercase">
                    {column.name}
                  </h2>
                  <span className="bg-black text-white font-mono text-xs font-bold px-2 py-1">
                    {getColumnTasks(column._id).length}
                  </span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3">
                {getColumnTasks(column._id).map((task: Task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onEdit={() => setEditingTask(task._id)}
                    onDragStart={() => handleDragStart(task._id)}
                    isDragging={draggedTask === task._id}
                  />
                ))}

                {addingToColumn === column._id ? (
                  <div className="border-3 border-black border-dashed p-3 bg-[#F5F5F0]" style={{ borderWidth: '3px' }}>
                    <input
                      type="text"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="TASK TITLE"
                      autoFocus
                      className="w-full border-2 border-black p-2 font-mono text-xs uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-[#FF3B30]"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddTask(column._id);
                        if (e.key === "Escape") setAddingToColumn(null);
                      }}
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleAddTask(column._id)}
                        className="flex-1 bg-black text-white font-mono font-bold py-2 text-xs uppercase tracking-wider hover:bg-[#FF3B30] transition-colors"
                      >
                        ADD
                      </button>
                      <button
                        onClick={() => setAddingToColumn(null)}
                        className="flex-1 border-2 border-black font-mono font-bold py-2 text-xs uppercase tracking-wider hover:bg-white transition-colors"
                      >
                        CANCEL
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingToColumn(column._id)}
                    className="w-full border-3 border-black border-dashed p-3 font-mono text-xs uppercase tracking-wider hover:bg-[#FFEB3B] hover:border-solid transition-all"
                    style={{ borderWidth: '3px' }}
                  >
                    + ADD TASK
                  </button>
                )}
              </div>
            </div>
          ))}

          {isAddingColumn ? (
            <form onSubmit={handleAddColumn} className="flex-shrink-0 w-72 md:w-80 border-4 border-black border-dashed bg-white p-4 shadow-[6px_6px_0_0_#000]">
              <input
                type="text"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                placeholder="COLUMN NAME"
                autoFocus
                className="w-full border-3 border-black p-3 font-mono text-sm uppercase tracking-wider focus:outline-none focus:ring-4 focus:ring-[#FF3B30] bg-[#F5F5F0]"
                style={{ borderWidth: '3px' }}
              />
              <div className="flex gap-2 mt-4">
                <button
                  type="submit"
                  className="flex-1 bg-black text-white font-mono font-bold py-2 text-xs uppercase tracking-wider hover:bg-[#FF3B30] transition-colors"
                >
                  ADD
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingColumn(false)}
                  className="flex-1 border-3 border-black font-mono font-bold py-2 text-xs uppercase tracking-wider hover:bg-[#F5F5F0] transition-colors"
                  style={{ borderWidth: '3px' }}
                >
                  CANCEL
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsAddingColumn(true)}
              className="flex-shrink-0 w-72 md:w-80 border-4 border-black border-dashed bg-transparent hover:bg-white hover:border-solid transition-all flex items-center justify-center gap-3 min-h-[200px]"
            >
              <span className="font-mono text-base font-bold uppercase tracking-wider">+ ADD COLUMN</span>
            </button>
          )}
        </div>
      </div>

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setEditingTask(null)}
        />
      )}
    </div>
  );
}
