"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "/api";

  // ============================================================
  // SCROLL TO LATEST MESSAGE
  // ============================================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  // ============================================================
  // GET SUGGESTED QUESTIONS
  // ============================================================

  useEffect(() => {
    if (!isOpen || suggestions.length > 0) {
      return;
    }

    const fetchSuggestions = async () => {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        return;
      }

      setLoadingSuggestions(true);

      try {
        const response = await fetch(
          `${API_URL}/chatbot/suggestions`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch suggestions");
        }

        const data = await response.json();

        if (Array.isArray(data.questions)) {
          setSuggestions(data.questions);
        }
      } catch (error) {
        console.error(
          "Failed to load chatbot suggestions:",
          error,
        );
      } finally {
        setLoadingSuggestions(false);
      }
    };

    fetchSuggestions();
  }, [isOpen, suggestions.length, API_URL]);

  // ============================================================
  // SEND MESSAGE
  // ============================================================

  const sendMessage = async (text?: string) => {
    const userMessage = (text ?? message).trim();

    if (!userMessage || loading) {
      return;
    }

    const token = localStorage.getItem("accessToken");

    if (!token) {
      return;
    }

    setMessage("");

    setMessages((previous) => [
      ...previous,
      {
        role: "user",
        content: userMessage,
      },
    ]);

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/chatbot/message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            message: userMessage,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to send message",
        );
      }

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            data.answer ||
            "Sorry, I couldn't generate a response.",
        },
      ]);
    } catch (error) {
      console.error("Chatbot error:", error);

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // ENTER TO SEND
  // ============================================================

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <>
      {/* ========================================================
          CHAT WINDOW
      ======================================================== */}

      {isOpen && (
        <div
          className="
            fixed bottom-24 right-5 z-[100]
            flex h-[520px] w-[380px]
            flex-col overflow-hidden
            rounded-3xl
            border border-slate-200
            bg-white
            shadow-2xl shadow-slate-900/20
          "
        >
          {/* ====================================================
              HEADER
          ==================================================== */}

          <div className="flex items-center justify-between bg-gradient-to-r from-orange-500 to-blue-600 px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-lg backdrop-blur">
                ✨
              </div>

              <div>
                <h3 className="font-bold">
                  Career Navigator AI
                </h3>

                <p className="text-xs text-white/80">
                  Your career assistant
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="
                flex h-8 w-8 items-center justify-center
                rounded-lg
                text-xl
                transition
                hover:bg-white/15
              "
              aria-label="Close chatbot"
            >
              ×
            </button>
          </div>

          {/* ====================================================
              MESSAGES AREA
          ==================================================== */}

          <div className="flex-1 overflow-y-auto bg-slate-50 p-4">

            {/* ==================================================
                EMPTY STATE
            ================================================== */}

            {messages.length === 0 && (
              <div className="space-y-4">

                {/* Welcome message */}

                <div className="rounded-2xl rounded-tl-md border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-sm leading-6 text-slate-700">
                    Hey! 👋 I'm your Career Navigator AI
                    assistant. Ask me anything about your
                    career, skills, roadmap, or job preparation.
                  </p>
                </div>

                {/* Suggested questions */}

                <div>
                  <p className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-slate-400">
                    Suggested questions
                  </p>

                  {loadingSuggestions ? (
                    <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-400 shadow-sm">
                      Loading suggestions...
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {suggestions.map(
                        (question, index) => (
                          <button
                            key={index}
                            onClick={() =>
                              sendMessage(question)
                            }
                            className="
                              w-full
                              rounded-xl
                              border border-slate-200
                              bg-white
                              px-3 py-2.5
                              text-left
                              text-sm
                              text-slate-600
                              shadow-sm
                              transition
                              hover:border-orange-300
                              hover:bg-orange-50
                              hover:text-orange-600
                            "
                          >
                            {question}
                          </button>
                        ),
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ==================================================
                CONVERSATION
            ================================================== */}

            {messages.map((chatMessage, index) => (
              <div
                key={index}
                className={`mb-3 flex ${
                  chatMessage.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`
                    max-w-[85%]
                    rounded-2xl
                    px-4 py-3
                    text-sm
                    leading-6
                    ${
                      chatMessage.role === "user"
                        ? `
                          rounded-br-md
                          bg-blue-600
                          text-white
                          shadow-sm
                        `
                        : `
                          rounded-bl-md
                          border border-slate-200
                          bg-white
                          text-slate-700
                          shadow-sm
                        `
                    }
                  `}
                >
                  {chatMessage.role === "assistant" ? (
                    <ReactMarkdown
                      components={{
                        /* -----------------------------
                           Paragraph
                        ----------------------------- */

                        p: ({ children }) => (
                          <p className="mb-3 last:mb-0">
                            {children}
                          </p>
                        ),

                        /* -----------------------------
                           Bold
                        ----------------------------- */

                        strong: ({ children }) => (
                          <strong className="font-bold text-slate-900">
                            {children}
                          </strong>
                        ),

                        /* -----------------------------
                           Unordered list
                        ----------------------------- */

                        ul: ({ children }) => (
                          <ul className="mb-3 ml-5 list-disc space-y-1.5">
                            {children}
                          </ul>
                        ),

                        /* -----------------------------
                           Ordered list
                        ----------------------------- */

                        ol: ({ children }) => (
                          <ol className="mb-3 ml-5 list-decimal space-y-1.5">
                            {children}
                          </ol>
                        ),

                        /* -----------------------------
                           List item
                        ----------------------------- */

                        li: ({ children }) => (
                          <li className="pl-1">
                            {children}
                          </li>
                        ),

                        /* -----------------------------
                           Headings
                        ----------------------------- */

                        h1: ({ children }) => (
                          <h1 className="mb-3 text-base font-bold text-slate-900">
                            {children}
                          </h1>
                        ),

                        h2: ({ children }) => (
                          <h2 className="mb-3 text-base font-bold text-slate-900">
                            {children}
                          </h2>
                        ),

                        h3: ({ children }) => (
                          <h3 className="mb-2 text-sm font-bold text-slate-900">
                            {children}
                          </h3>
                        ),

                        /* -----------------------------
                           Code
                        ----------------------------- */

                        code: ({ children }) => (
                          <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[12px] text-slate-800">
                            {children}
                          </code>
                        ),

                        /* -----------------------------
                           Blockquote
                        ----------------------------- */

                        blockquote: ({ children }) => (
                          <blockquote className="my-3 border-l-4 border-orange-300 pl-3 italic text-slate-500">
                            {children}
                          </blockquote>
                        ),
                      }}
                    >
                      {chatMessage.content}
                    </ReactMarkdown>
                  ) : (
                    <p className="whitespace-pre-wrap">
                      {chatMessage.content}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {/* ==================================================
                TYPING INDICATOR
            ================================================== */}

            {loading && (
              <div className="mb-3 flex justify-start">
                <div className="rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />

                    <span
                      className="h-2 w-2 animate-bounce rounded-full bg-slate-400"
                      style={{
                        animationDelay: "150ms",
                      }}
                    />

                    <span
                      className="h-2 w-2 animate-bounce rounded-full bg-slate-400"
                      style={{
                        animationDelay: "300ms",
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ====================================================
              INPUT
          ==================================================== */}

          <div className="border-t border-slate-200 bg-white p-3">
            <div
              className="
                flex items-end gap-2
                rounded-2xl
                border border-slate-200
                bg-slate-50
                p-2
                transition
                focus-within:border-orange-400
                focus-within:ring-2
                focus-within:ring-orange-100
              "
            >
              <textarea
                value={message}
                onChange={(event) =>
                  setMessage(event.target.value)
                }
                onKeyDown={handleKeyDown}
                maxLength={1000}
                rows={1}
                disabled={loading}
                placeholder="Ask about your career..."
                className="
                  max-h-24
                  flex-1
                  resize-none
                  bg-transparent
                  px-2 py-2
                  text-sm
                  text-slate-700
                  outline-none
                  placeholder:text-slate-400
                  disabled:opacity-50
                "
              />

              <button
                onClick={() => sendMessage()}
                disabled={!message.trim() || loading}
                className="
                  flex h-9 w-9 shrink-0
                  items-center justify-center
                  rounded-xl
                  bg-gradient-to-r
                  from-orange-500
                  to-blue-600
                  text-white
                  transition
                  hover:scale-105
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
                aria-label="Send message"
              >
                ↑
              </button>
            </div>

            <p className="mt-1 px-1 text-[10px] text-slate-400">
              Enter to send · Shift + Enter for new line
            </p>
          </div>
        </div>
      )}

      {/* ========================================================
          FLOATING BUTTON
      ======================================================== */}

      <div className="group fixed bottom-5 right-5 z-[100]">

  {/* Tooltip */}

  <div
    className="
      pointer-events-none
      absolute bottom-full right-0 mb-3
      whitespace-nowrap
      rounded-xl
      border border-slate-200
      bg-white
      px-4 py-2.5
      text-sm font-semibold
      text-slate-700
      shadow-lg shadow-slate-900/10
      opacity-0
      translate-y-1
      transition-all duration-200
      group-hover:translate-y-0
      group-hover:opacity-100
    "
  >
    Career Navigator AI

    {/* Small tooltip arrow */}

    <div
      className="
        absolute -bottom-1.5 right-5
        h-3 w-3
        rotate-45
        border-r border-b border-slate-200
        bg-white
      "
    />
    </div>

    {/* Chatbot button */}

    <button
        onClick={() =>
        setIsOpen((previous) => !previous)
        }
        className="
        flex h-14 w-14
        items-center justify-center
        rounded-2xl
        bg-gradient-to-br
        from-orange-500
        to-blue-600
        text-2xl
        text-white
        shadow-xl
        shadow-slate-900/20
        transition
        duration-200
        hover:-translate-y-1
        hover:scale-105
        hover:shadow-2xl
        "
        aria-label={
        isOpen
            ? "Close career assistant"
            : "Open career assistant"
        }
    >
        {isOpen ? "×" : "✨"}
    </button>

    </div>
    </>
  );
}