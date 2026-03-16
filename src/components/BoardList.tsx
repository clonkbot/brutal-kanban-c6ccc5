import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";

interface BoardListProps {
  onSelectBoard: (boardId: Id<"boards">) => void;
}

interface Board {
  _id: Id<"boards">;
  name: string;
  createdAt: number;
}

export function BoardList({ onSelectBoard }: BoardListProps) {
  const boards = useQuery(api.boards.list) as Board[] | undefined;
  const createBoard = useMutation(api.boards.create);
  const deleteBoard = useMutation(api.boards.remove);
  const [newBoardName, setNewBoardName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardName.trim()) return;

    const boardId = await createBoard({ name: newBoardName.toUpperCase() });
    setNewBoardName("");
    setIsCreating(false);
    onSelectBoard(boardId);
  };

  const handleDelete = async (e: React.MouseEvent, boardId: Id<"boards">) => {
    e.stopPropagation();
    if (confirm("DELETE THIS BOARD? ALL TASKS WILL BE LOST.")) {
      await deleteBoard({ id: boardId });
    }
  };

  if (boards === undefined) {
    return (
      <div className="p-4 md:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border-4 border-black bg-white h-40 animate-pulse shadow-[6px_6px_0_0_#000]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8">
        <h2 className="font-mono text-2xl md:text-4xl font-bold tracking-tight uppercase">
          Your Boards
        </h2>
        <div className="w-20 md:w-32 h-1 md:h-2 bg-[#FF3B30] mt-2" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {boards.map((board: Board) => (
          <div
            key={board._id}
            onClick={() => onSelectBoard(board._id)}
            className="group border-4 border-black bg-white p-4 md:p-6 cursor-pointer hover:bg-[#FFEB3B] transition-colors shadow-[6px_6px_0_0_#000] hover:shadow-[8px_8px_0_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5"
          >
            <div className="flex justify-between items-start">
              <h3 className="font-mono text-lg md:text-xl font-bold tracking-tight break-words flex-1 mr-2">
                {board.name}
              </h3>
              <button
                onClick={(e) => handleDelete(e, board._id)}
                className="opacity-0 group-hover:opacity-100 bg-[#FF3B30] text-white p-2 font-mono text-xs font-bold hover:bg-black transition-all flex-shrink-0"
              >
                DEL
              </button>
            </div>
            <p className="font-mono text-xs text-black/50 mt-4 uppercase">
              Created {new Date(board.createdAt).toLocaleDateString()}
            </p>
            <div className="mt-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-[#FF3B30]" />
              <span className="font-mono text-xs uppercase tracking-wider">Click to open</span>
            </div>
          </div>
        ))}

        {isCreating ? (
          <form onSubmit={handleCreate} className="border-4 border-black border-dashed bg-white p-4 md:p-6 shadow-[6px_6px_0_0_#000]">
            <input
              type="text"
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
              placeholder="BOARD NAME"
              autoFocus
              className="w-full border-3 border-black p-3 font-mono text-sm uppercase tracking-wider focus:outline-none focus:ring-4 focus:ring-[#FF3B30] bg-[#F5F5F0]"
              style={{ borderWidth: '3px' }}
            />
            <div className="flex gap-2 mt-4">
              <button
                type="submit"
                className="flex-1 bg-black text-white font-mono font-bold py-2 text-xs uppercase tracking-wider hover:bg-[#FF3B30] transition-colors"
              >
                CREATE
              </button>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="flex-1 border-3 border-black font-mono font-bold py-2 text-xs uppercase tracking-wider hover:bg-[#F5F5F0] transition-colors"
                style={{ borderWidth: '3px' }}
              >
                CANCEL
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsCreating(true)}
            className="border-4 border-black border-dashed bg-transparent p-4 md:p-6 cursor-pointer hover:bg-white hover:border-solid transition-all min-h-[160px] flex flex-col items-center justify-center gap-3"
          >
            <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-black flex items-center justify-center bg-[#FFEB3B]">
              <span className="text-3xl md:text-4xl font-mono font-bold">+</span>
            </div>
            <span className="font-mono text-sm md:text-base font-bold uppercase tracking-wider">New Board</span>
          </button>
        )}
      </div>

      {boards.length === 0 && !isCreating && (
        <div className="text-center mt-8 md:mt-12 p-6 md:p-8 border-4 border-black bg-white shadow-[6px_6px_0_0_#000]">
          <p className="font-mono text-base md:text-lg uppercase tracking-wider mb-4">No boards yet</p>
          <p className="font-mono text-xs md:text-sm text-black/50">Create your first board to get started</p>
        </div>
      )}
    </div>
  );
}
