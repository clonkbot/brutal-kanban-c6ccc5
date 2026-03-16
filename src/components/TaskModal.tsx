import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Task } from "./TaskCard";
import { useState } from "react";

interface TaskModalProps {
  task: Task;
  onClose: () => void;
}

export function TaskModal({ task, onClose }: TaskModalProps) {
  const updateTask = useMutation(api.tasks.update);
  const deleteTask = useMutation(api.tasks.remove);

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [priority, setPriority] = useState<"low" | "medium" | "high" | undefined>(task.priority);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await updateTask({
      id: task._id,
      title: title.toUpperCase(),
      description: description || undefined,
      priority,
    });
    setSaving(false);
    onClose();
  };

  const handleDelete = async () => {
    if (confirm("DELETE THIS TASK?")) {
      await deleteTask({ id: task._id });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg border-4 border-black bg-white shadow-[12px_12px_0_0_#000] max-h-[90vh] overflow-y-auto">
        <div className="bg-black text-white p-4 flex justify-between items-center sticky top-0">
          <h2 className="font-mono text-lg md:text-xl font-bold tracking-tight uppercase">
            EDIT TASK
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-[#FF3B30] text-2xl font-bold leading-none"
          >
            &times;
          </button>
        </div>

        <div className="p-4 md:p-6 space-y-4 md:space-y-6">
          <div>
            <label className="block font-mono text-xs font-bold mb-2 uppercase tracking-wider">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border-3 border-black p-3 font-mono text-sm uppercase tracking-wider focus:outline-none focus:ring-4 focus:ring-[#FF3B30] bg-[#F5F5F0]"
              style={{ borderWidth: '3px' }}
            />
          </div>

          <div>
            <label className="block font-mono text-xs font-bold mb-2 uppercase tracking-wider">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full border-3 border-black p-3 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-[#FF3B30] bg-[#F5F5F0] resize-none"
              style={{ borderWidth: '3px' }}
              placeholder="Add description..."
            />
          </div>

          <div>
            <label className="block font-mono text-xs font-bold mb-2 uppercase tracking-wider">
              Priority
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: undefined, label: "NONE", color: "bg-[#F5F5F0] border-black" },
                { value: "low" as const, label: "LOW", color: "bg-[#34C759] text-white" },
                { value: "medium" as const, label: "MEDIUM", color: "bg-[#FF9500] text-white" },
                { value: "high" as const, label: "HIGH", color: "bg-[#FF3B30] text-white" },
              ].map((option) => (
                <button
                  key={option.label}
                  onClick={() => setPriority(option.value)}
                  className={`font-mono text-xs font-bold px-3 py-2 border-3 border-black transition-all ${
                    priority === option.value
                      ? `${option.color} shadow-[3px_3px_0_0_#000]`
                      : "bg-white hover:bg-[#F5F5F0]"
                  }`}
                  style={{ borderWidth: '3px' }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t-4 border-black">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-black text-white font-mono font-bold py-3 text-sm uppercase tracking-wider hover:bg-[#FF3B30] transition-colors disabled:opacity-50 border-3 border-black"
              style={{ borderWidth: '3px' }}
            >
              {saving ? "SAVING..." : "SAVE CHANGES"}
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 bg-[#FF3B30] text-white font-mono font-bold py-3 text-sm uppercase tracking-wider hover:bg-black transition-colors border-3 border-black"
              style={{ borderWidth: '3px' }}
            >
              DELETE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
