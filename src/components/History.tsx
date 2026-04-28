import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  getChatHistory,
  deleteChatSession,
  type ChatSession,
} from "@/services/api";
import toast from "react-hot-toast";
import {
  MessageCircle,
  Trash2,
  Clock,
  ChevronRight,
  Search,
  Inbox,
  AlertCircle,
} from "lucide-react";

export default function History() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const data = await getChatHistory();
      setSessions(data);
    } catch {
      toast.error("Failed to load chat history");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeletingId(id);
    try {
      await deleteChatSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
      toast.success("Chat deleted");
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Chat History
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Your previous health consultations
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search conversations..."
          className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 pl-10 pr-4 py-3 text-sm text-gray-800 dark:text-white placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
        />
      </div>

      {/* Sessions List */}
      <AnimatePresence>
        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-24 rounded-2xl" />
            ))}
          </div>
        )}

        {!isLoading && filteredSessions.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800 mx-auto mb-4">
              {search ? (
                <Search className="h-8 w-8 text-gray-400" />
              ) : (
                <Inbox className="h-8 w-8 text-gray-400" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400">
              {search ? "No matching chats found" : "No chat history yet"}
            </h3>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              {search
                ? "Try a different search term"
                : "Start a new consultation to see your history here"}
            </p>
            {!search && (
              <Link
                to="/chat"
                className="inline-flex items-center gap-2 mt-4 rounded-xl bg-primary-500 text-white px-5 py-2.5 text-sm font-semibold hover:bg-primary-600 transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                Start New Chat
              </Link>
            )}
          </motion.div>
        )}

        {!isLoading && filteredSessions.length > 0 && (
          <div className="space-y-3">
            {filteredSessions.map((session, idx) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
              >
                <Link
                  to={`/chat/${session.id}`}
                  className="group block rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4 shadow-sm hover:shadow-md hover:border-primary-200 dark:hover:border-primary-700/30 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-900/20">
                      <MessageCircle className="h-5 w-5 text-primary-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">
                        {session.title}
                      </h3>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(session.updatedAt || session.createdAt)}
                        <span className="mx-1">•</span>
                        {session.messages.length} messages
                      </p>
                      {/* Last message preview */}
                      {session.messages.length > 0 && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
                          {session.messages[session.messages.length - 1]?.content?.slice(
                            0,
                            100
                          )}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleDelete(session.id, e)}
                        disabled={deletingId === session.id}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100"
                      >
                        {deletingId === session.id ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                      <ChevronRight className="h-4 w-4 text-gray-300 dark:text-gray-600 group-hover:text-primary-500 transition-colors" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Disclaimer */}
      <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30 px-4 py-3 flex items-start gap-2">
        <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700 dark:text-amber-400">
          Chat history is stored locally on your device. Past AI responses are for
          reference only and should not replace professional medical advice.
        </p>
      </div>
    </div>
  );
}
