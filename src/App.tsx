import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { BoardList } from "./components/BoardList";
import { KanbanBoard } from "./components/KanbanBoard";
import { Id } from "../convex/_generated/dataModel";

function SignIn() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    try {
      await signIn("password", formData);
    } catch {
      setError(flow === "signIn" ? "INVALID CREDENTIALS" : "REGISTRATION FAILED");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="border-4 border-black bg-white shadow-[8px_8px_0_0_#000]">
          <div className="bg-black text-white p-4">
            <h1 className="font-mono text-2xl md:text-3xl font-bold tracking-tight">
              BRUTAL<span className="text-[#FF3B30]">KANBAN</span>
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block font-mono text-xs font-bold mb-2 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full border-3 border-black p-3 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-[#FF3B30] bg-[#F5F5F0]"
                  placeholder="YOUR@EMAIL.COM"
                  style={{ borderWidth: '3px' }}
                />
              </div>

              <div>
                <label className="block font-mono text-xs font-bold mb-2 uppercase tracking-wider">
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  className="w-full border-3 border-black p-3 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-[#FF3B30] bg-[#F5F5F0]"
                  placeholder="••••••••"
                  style={{ borderWidth: '3px' }}
                />
              </div>

              <input name="flow" type="hidden" value={flow} />
            </div>

            {error && (
              <div className="bg-[#FF3B30] text-white p-3 font-mono text-xs font-bold">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white font-mono font-bold py-4 text-lg uppercase tracking-wider hover:bg-[#FF3B30] transition-colors disabled:opacity-50 border-3 border-black"
              style={{ borderWidth: '3px' }}
            >
              {loading ? "LOADING..." : flow === "signIn" ? "ENTER" : "REGISTER"}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
                className="font-mono text-xs underline underline-offset-4 hover:text-[#FF3B30]"
              >
                {flow === "signIn" ? "NO ACCOUNT? REGISTER" : "HAVE ACCOUNT? SIGN IN"}
              </button>
            </div>
          </form>
        </div>

        <button
          onClick={() => signIn("anonymous")}
          className="mt-4 w-full bg-[#F5F5F0] border-4 border-black font-mono font-bold py-3 text-sm uppercase tracking-wider hover:bg-[#FFEB3B] transition-colors shadow-[4px_4px_0_0_#000]"
        >
          CONTINUE AS GUEST
        </button>
      </div>
    </div>
  );
}

function AuthenticatedApp() {
  const { signOut } = useAuthActions();
  const [selectedBoardId, setSelectedBoardId] = useState<Id<"boards"> | null>(null);

  return (
    <div className="min-h-screen bg-[#F5F5F0] flex flex-col">
      <header className="bg-black text-white border-b-4 border-black sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 md:px-6 py-3">
          <button
            onClick={() => setSelectedBoardId(null)}
            className="font-mono text-xl md:text-2xl font-bold tracking-tight hover:text-[#FF3B30] transition-colors"
          >
            BRUTAL<span className="text-[#FF3B30]">KANBAN</span>
          </button>

          <button
            onClick={() => signOut()}
            className="bg-white text-black font-mono font-bold px-3 py-2 md:px-4 text-xs md:text-sm uppercase tracking-wider hover:bg-[#FF3B30] hover:text-white transition-colors border-2 border-white"
          >
            LOGOUT
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        {selectedBoardId ? (
          <KanbanBoard boardId={selectedBoardId} onBack={() => setSelectedBoardId(null)} />
        ) : (
          <BoardList onSelectBoard={setSelectedBoardId} />
        )}
      </main>

      <footer className="py-3 px-4 text-center border-t-2 border-black/10 bg-[#F5F5F0]">
        <p className="font-mono text-[10px] md:text-xs text-black/40 tracking-wide">
          Requested by @web-user · Built by @clonkbot
        </p>
      </footer>
    </div>
  );
}

export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block border-4 border-black bg-white p-6 shadow-[8px_8px_0_0_#000] animate-pulse">
            <span className="font-mono text-xl font-bold tracking-tight">LOADING...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <SignIn />;
  }

  return <AuthenticatedApp />;
}
