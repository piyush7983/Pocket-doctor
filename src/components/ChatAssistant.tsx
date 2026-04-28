import { useState, useRef, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  sendChatMessage,
  getChatSession,
  type ChatMessage,
  type ChatSession,
} from "@/services/api";
import toast from "react-hot-toast";
import {
  Send,
  Mic,
  MicOff,
  Stethoscope,
  AlertTriangle,
  Sparkles,
  Copy,
  StopCircle,
} from "lucide-react";

// Simple markdown-style renderer for AI messages
function formatMessage(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n\n/g, "<br/><br/>")
    .replace(/\n/g, "<br/>")
    .replace(/^- (.*)/gm, "• $1")
    .replace(/🚨/g, '<span class="text-red-500">🚨</span>')
    .replace(/⚠️/g, '<span class="text-amber-500">⚠️</span>')
    .replace(/🩺/g, "🩺")
    .replace(/👋/g, "👋")
    .replace(/🌡️/g, "🌡️")
    .replace(/🤧/g, "🤧")
    .replace(/🫄/g, "🫄")
    .replace(/🌿/g, "🌿");
}

function isEmergency(text: string): boolean {
  const emergencyPhrases = [
    "emergency warning", "call 108", "call 112", "🚨", "heart attack",
    "immediately", "emergency room",
  ];
  return emergencyPhrases.some((phrase) => text.toLowerCase().includes(phrase.toLowerCase()));
}

export default function ChatAssistant() {
  const { sessionId } = useParams<{ sessionId?: string }>();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>(sessionId);
  const [showEmergency, setShowEmergency] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  // Load session if sessionId provided
  useEffect(() => {
    if (sessionId) {
      loadSession(sessionId);
    }
  }, [sessionId]);

  // Save messages to localStorage for mock persistence
  useEffect(() => {
    if (messages.length > 0 && currentSessionId) {
      const sessionsStr = localStorage.getItem("chatSessions");
      const sessions: ChatSession[] = sessionsStr ? JSON.parse(sessionsStr) : [];
      const existingIdx = sessions.findIndex((s) => s.id === currentSessionId);
      const session: ChatSession = {
        id: currentSessionId,
        title: messages[0]?.content?.slice(0, 40) + "..." || "New Chat",
        messages,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (existingIdx >= 0) {
        sessions[existingIdx] = session;
      } else {
        sessions.unshift(session);
      }
      localStorage.setItem("chatSessions", JSON.stringify(sessions));
    }
  }, [messages, currentSessionId]);

  const loadSession = async (sid: string) => {
    const session = await getChatSession(sid);
    if (session) {
      setMessages(session.messages);
      setCurrentSessionId(sid);
    }
  };

  // Welcome message
  useEffect(() => {
    if (!sessionId && messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content:
            "👋 **Namaste!** I'm your AI Health Assistant, powered by Swasthya Sahayak.\n\nYou can tell me about your symptoms in **English or Hinglish**, and I'll help you understand:\n• Possible causes\n• Home remedies\n• Safe OTC options\n• When to see a doctor\n\n**How can I help you feel better today?**\n\n⚠️ *Remember: This is not a medical diagnosis. Always consult a doctor.*",
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  }, [sessionId]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = {
      id: "user-" + Date.now(),
      role: "user",
      content: trimmed,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const result = await sendChatMessage(trimmed, currentSessionId);
      setCurrentSessionId(result.sessionId);

      const aiMsg: ChatMessage = {
        id: "ai-" + Date.now(),
        role: "assistant",
        content: result.response,
        timestamp: new Date().toISOString(),
      };

      // Show emergency banner if needed
      if (isEmergency(result.response)) {
        setShowEmergency(true);
      }

      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      toast.error("Failed to get response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Voice input using Web Speech API
  const toggleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Voice input is not supported in your browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => prev + " " + transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      toast.error("Voice recognition failed. Please try again.");
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    toast.success("Listening... Speak now!");
  };

  const copyMessage = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Copied to clipboard!");
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] lg:h-[calc(100vh-4rem)]">
      {/* Emergency Banner */}
      <AnimatePresence>
        {showEmergency && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-start gap-3 rounded-2xl bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 p-4 mb-4 animate-pulse-red">
              <AlertTriangle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-red-700 dark:text-red-400">
                  🚨 Emergency Alert
                </h3>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  Based on your symptoms, please seek emergency medical help immediately.
                  Call <strong>108</strong> or <strong>112</strong>.
                </p>
              </div>
              <button
                onClick={() => setShowEmergency(false)}
                className="text-red-400 hover:text-red-600 transition-colors"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4 scroll-smooth">
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {/* AI Avatar */}
              {msg.role === "assistant" && (
                <div className="flex-shrink-0 mr-2 mt-1">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-medical-500 shadow-md">
                    <Stethoscope className="h-4 w-4 text-white" />
                  </div>
                </div>
              )}

              {/* Message Bubble */}
              <div className="group relative max-w-[80%] lg:max-w-[70%]">
                <div
                  className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                    msg.role === "user"
                      ? "bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-br-md"
                      : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-md border border-gray-100 dark:border-gray-700"
                  }`}
                  dangerouslySetInnerHTML={{
                    __html: formatMessage(msg.content),
                  }}
                />

                {/* Copy button for AI messages */}
                {msg.role === "assistant" && (
                  <button
                    onClick={() => copyMessage(msg.content)}
                    className="absolute -bottom-6 left-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex items-center gap-1"
                  >
                    <Copy className="h-3 w-3" />
                    Copy
                  </button>
                )}

                {/* Timestamp */}
                <p className="mt-1 text-[10px] text-gray-400 dark:text-gray-500 px-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              {/* User Avatar */}
              {msg.role === "user" && (
                <div className="flex-shrink-0 ml-2 mt-1">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-medical-400 to-blue-500 shadow-md text-white text-xs font-bold">
                    You
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex justify-start"
            >
              <div className="flex-shrink-0 mr-2 mt-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-medical-500 shadow-md">
                  <Stethoscope className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="rounded-2xl rounded-bl-md bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-5 py-3 shadow-sm">
                <div className="flex gap-1.5">
                  <div className="typing-dot h-2 w-2 rounded-full bg-primary-400" />
                  <div className="typing-dot h-2 w-2 rounded-full bg-primary-400" />
                  <div className="typing-dot h-2 w-2 rounded-full bg-primary-400" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 pt-4">
        <div className="relative rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg shadow-gray-200/50 dark:shadow-black/20 p-2 flex items-center gap-2">
          {/* Voice Input */}
          <button
            onClick={toggleVoiceInput}
            className={`flex-shrink-0 p-2 rounded-xl transition-all duration-200 ${
              isListening
                ? "bg-red-100 dark:bg-red-900/30 text-red-500 animate-pulse"
                : "text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20"
            }`}
            title="Voice input"
          >
            {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>

          {/* Text Input */}
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your symptoms... (English or Hinglish)"
            className="flex-1 bg-transparent px-2 py-2 text-sm text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none"
            disabled={isLoading}
          />

          {/* Send Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="flex-shrink-0 p-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md shadow-primary-200 dark:shadow-primary-900/30 hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-md"
          >
            {isLoading ? (
              <StopCircle className="h-5 w-5" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </motion.button>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-[10px] text-gray-400 dark:text-gray-500 mt-2 flex items-center justify-center gap-1">
          <Sparkles className="h-3 w-3" />
          AI responses are informational only. Always consult a doctor for medical advice.
        </p>
      </div>
    </div>
  );
}
