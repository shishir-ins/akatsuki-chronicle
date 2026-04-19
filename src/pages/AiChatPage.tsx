import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  Image as ImageIcon,
  MessageSquare,
  Plus,
  Send,
  Sparkles,
  Trash2,
  User,
  X,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import AuthPanel from "@/components/AuthPanel";
import { useAuth } from "@/hooks/useAuth";
import jiraiyaImg from "@/assets/jiraiya.png";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
}

export default function AiChatPage() {
  const { user, loading } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (!textareaRef.current) {
      return;
    }

    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
  }, [input]);

  const loadConversations = useCallback(async () => {
    if (!user) {
      setConversations([]);
      return;
    }

    const { data } = await supabase
      .from("chat_conversations")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (data) {
      setConversations(data);
    }
  }, [user]);

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (activeConversationId) {
      void loadMessages(activeConversationId);
    } else {
      setMessages([]);
    }
  }, [activeConversationId]);

  const loadMessages = async (conversationId: string) => {
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (data) {
      setMessages(
        data.map((message) => ({
          role: message.role as "user" | "assistant",
          content: message.image_url
            ? [
                ...(message.content ? [{ type: "text" as const, text: message.content }] : []),
                { type: "image_url" as const, image_url: { url: message.image_url } },
              ]
            : message.content,
        })),
      );
    }
  };

  const createConversation = async (firstMessage: string): Promise<string> => {
    const title = firstMessage.slice(0, 50) + (firstMessage.length > 50 ? "..." : "");
    const { data } = await supabase
      .from("chat_conversations")
      .insert({ title, user_id: user?.id ?? null })
      .select()
      .single();

    if (!data) {
      throw new Error("Failed to create conversation");
    }

    setConversations((current) => [data, ...current]);
    setActiveConversationId(data.id);
    return data.id;
  };

  const saveMessage = async (
    conversationId: string,
    role: string,
    content: string,
    imageUrl?: string | null,
  ) => {
    await supabase.from("chat_messages").insert({
      conversation_id: conversationId,
      role,
      content,
      image_url: imageUrl || null,
    });

    await supabase
      .from("chat_conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId);
  };

  const deleteConversation = async (conversationId: string) => {
    await supabase.from("chat_conversations").delete().eq("id", conversationId);
    setConversations((current) => current.filter((conversation) => conversation.id !== conversationId));
    if (activeConversationId === conversationId) {
      setActiveConversationId(null);
      setMessages([]);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("File too large. Max 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAttachedImage(reader.result as string);
      setAttachedFileName(file.name);
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getDisplayText = (content: Message["content"]): string => {
    if (typeof content === "string") {
      return content;
    }

    return content
      .filter((part) => part.type === "text")
      .map((part) => part.text)
      .join("\n");
  };

  const getDisplayImage = (content: Message["content"]): string | null => {
    if (typeof content === "string") {
      return null;
    }

    const imagePart = content.find((part) => part.type === "image_url");
    return imagePart?.image_url?.url || null;
  };

  const sendMessage = async () => {
    const text = input.trim();
    if ((!text && !attachedImage) || isLoading || !user) {
      return;
    }

    const userContent: Message["content"] = attachedImage
      ? [
          ...(text ? [{ type: "text" as const, text }] : []),
          { type: "image_url" as const, image_url: { url: attachedImage } },
        ]
      : text;

    const nextMessages = [...messages, { role: "user" as const, content: userContent }];
    setMessages(nextMessages);
    setInput("");

    const savedImage = attachedImage;
    setAttachedImage(null);
    setAttachedFileName(null);
    setIsLoading(true);

    let conversationId = activeConversationId;
    if (!conversationId) {
      try {
        conversationId = await createConversation(text || "Image analysis");
      } catch {
        setIsLoading(false);
        return;
      }
    }

    await saveMessage(conversationId, "user", text, savedImage);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: nextMessages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
        }),
      });

      if (!response.ok || !response.body) {
        const errorBody = await response
          .json()
          .catch(() => ({ error: "Failed to connect to AI" }));
        const errorMessage = `Warning: ${errorBody.error || "Something went wrong. Try again."}`;
        setMessages((current) => [...current, { role: "assistant", content: errorMessage }]);
        await saveMessage(conversationId, "assistant", errorMessage);
        setIsLoading(false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistantText = "";
      let doneStreaming = false;

      while (!doneStreaming) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) {
            line = line.slice(0, -1);
          }
          if (line.startsWith(":") || line.trim() === "" || !line.startsWith("data: ")) {
            continue;
          }

          const jsonString = line.slice(6).trim();
          if (jsonString === "[DONE]") {
            doneStreaming = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonString);
            const delta = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (delta) {
              assistantText += delta;
              setMessages((current) => {
                const last = current[current.length - 1];
                if (last?.role === "assistant") {
                  return current.map((message, index) =>
                    index === current.length - 1
                      ? { ...message, content: assistantText }
                      : message,
                  );
                }
                return [...current, { role: "assistant", content: assistantText }];
              });
            }
          } catch {
            buffer = `${line}\n${buffer}`;
            break;
          }
        }
      }

      if (buffer.trim()) {
        buffer.split("\n").forEach((raw) => {
          let line = raw;
          if (!line) {
            return;
          }
          if (line.endsWith("\r")) {
            line = line.slice(0, -1);
          }
          if (line.startsWith(":") || line.trim() === "" || !line.startsWith("data: ")) {
            return;
          }
          const jsonString = line.slice(6).trim();
          if (jsonString === "[DONE]") {
            return;
          }
          try {
            const parsed = JSON.parse(jsonString);
            const delta = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (delta) {
              assistantText += delta;
              setMessages((current) => {
                const last = current[current.length - 1];
                if (last?.role === "assistant") {
                  return current.map((message, index) =>
                    index === current.length - 1
                      ? { ...message, content: assistantText }
                      : message,
                  );
                }
                return [...current, { role: "assistant", content: assistantText }];
              });
            }
          } catch {
            return;
          }
        });
      }

      if (assistantText) {
        await saveMessage(conversationId, "assistant", assistantText);
      }
    } catch {
      const errorMessage = "Warning: Network error. Please check your connection.";
      setMessages((current) => [...current, { role: "assistant", content: errorMessage }]);
      await saveMessage(conversationId, "assistant", errorMessage);
    }

    setIsLoading(false);
    void loadConversations();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  };

  const startNewChat = () => {
    setActiveConversationId(null);
    setMessages([]);
    setSidebarOpen(false);
  };

  if (loading) {
    return <div className="min-h-screen pb-4" />;
  }

  if (!user) {
    return (
      <div className="relative min-h-screen overflow-hidden pb-24">
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-[0.03] grayscale transition-opacity duration-1000"
          style={{
            backgroundImage: `url(${jiraiyaImg})`,
            backgroundSize: "600px",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />

        <div className="container relative z-10 pt-20 animate-fade-in-up">
          <div className="mx-auto mb-6 flex flex-col items-center">
            <div className="glow-accent flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border-2 border-primary/20 bg-primary/10 p-2 shadow-2xl">
              <img
                src={jiraiyaImg}
                alt="Jiraiya Sensei"
                className="h-full w-full object-contain drop-shadow-md"
              />
            </div>
            <div className="mt-5 rounded-full border border-primary/30 bg-primary/10 px-5 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-primary">
              AI Guide System
            </div>
          </div>

          <AuthPanel
            title="Sign in for your AI study space"
            description="Your chat history is now private to your student account, so sign in to continue with Jiraiya Sensei."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen pb-4">
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-card pt-16 transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-border p-3">
          <button
            onClick={startNewChat}
            className="flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            <Plus className="h-4 w-4" />
            New chat
          </button>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-1 overflow-y-auto p-2">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={cn(
                "group flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition-all",
                activeConversationId === conversation.id
                  ? "border border-primary/20 bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
              onClick={() => {
                setActiveConversationId(conversation.id);
                setSidebarOpen(false);
              }}
            >
              <MessageSquare className="h-4 w-4 shrink-0" />
              <span className="flex-1 truncate">{conversation.title}</span>
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  void deleteConversation(conversation.id);
                }}
                className="text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}

          {conversations.length === 0 && (
            <p className="py-8 text-center text-xs text-muted-foreground">No chats yet</p>
          )}
        </div>
      </div>

      <div className="container mx-auto flex max-w-2xl flex-1 flex-col pt-20">
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed left-4 top-20 z-40 flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-all hover:text-primary"
        >
          <MessageSquare className="h-4 w-4" />
        </button>

        <div className="mb-4 text-center">
          <div className="glow-accent mx-auto mb-3 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-primary/20 bg-primary/10 p-1">
            <img src={jiraiyaImg} alt="Jiraiya Sensei" className="h-full w-full object-contain" />
          </div>
          <h1 className="text-xl font-extrabold text-foreground">
            Jiraiya <span className="text-primary">Sensei</span>
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Ask questions, revise concepts, and get quick study support.
          </p>
        </div>

        <div className="mb-4 flex-1 space-y-4 overflow-y-auto px-1" style={{ maxHeight: "calc(100vh - 320px)" }}>
          {messages.length === 0 && (
            <div className="space-y-4 py-16 text-center">
              <Sparkles className="mx-auto h-10 w-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                Ask about circuits, signals, machines, or upload an image to analyze.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  "Explain KVL and KCL simply",
                  "Short notes on Laplace Transform",
                  "How does a transformer work?",
                  "Op-amp virtual ground concept",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInput(suggestion)}
                    className="rounded-xl border border-border bg-secondary px-3 py-2 text-xs text-muted-foreground transition-all hover:border-primary/30 hover:text-foreground"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={cn("flex gap-3 animate-fade-in", message.role === "user" ? "justify-end" : "justify-start")}
            >
              {message.role === "assistant" && (
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-primary/20 bg-primary/10 p-0.5">
                  <img src={jiraiyaImg} alt="" className="h-full w-full object-contain" />
                </div>
              )}

              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
                  message.role === "user"
                    ? "rounded-br-md bg-primary text-primary-foreground"
                    : "surface rounded-bl-md",
                )}
              >
                {getDisplayImage(message.content) && (
                  <img
                    src={getDisplayImage(message.content)!}
                    alt="Uploaded"
                    className="mb-2 max-h-48 max-w-full rounded-xl border border-border"
                  />
                )}

                {message.role === "assistant" ? (
                  <div className="prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-foreground/90 prose-li:text-foreground/90 prose-strong:text-primary prose-code:rounded prose-code:bg-secondary prose-code:px-1 prose-pre:rounded-xl prose-pre:bg-secondary prose-pre:p-3">
                    <ReactMarkdown>{getDisplayText(message.content)}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{getDisplayText(message.content)}</p>
                )}
              </div>

              {message.role === "user" && (
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-border bg-secondary">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}

          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex gap-3 animate-fade-in">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-primary/20 bg-primary/10 p-0.5">
                <img src={jiraiyaImg} alt="" className="h-full w-full object-contain" />
              </div>
              <div className="surface rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                  <div className="h-2 w-2 animate-pulse rounded-full bg-primary" style={{ animationDelay: "0.15s" }} />
                  <div className="h-2 w-2 animate-pulse rounded-full bg-primary" style={{ animationDelay: "0.3s" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {attachedImage && (
          <div className="surface mx-1 mb-2 flex items-center gap-3 p-2 animate-fade-in">
            <img
              src={attachedImage}
              alt="Attached"
              className="h-16 w-16 rounded-xl border border-border object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs text-foreground">{attachedFileName}</p>
              <p className="text-[10px] text-muted-foreground">Ready to send with your message</p>
            </div>
            <button
              onClick={() => {
                setAttachedImage(null);
                setAttachedFileName(null);
              }}
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="surface mx-1 flex items-end gap-2 p-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf,.png,.jpg,.jpeg,.webp"
            className="hidden"
            onChange={handleFileUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary"
            title="Upload image or file"
          >
            <ImageIcon className="h-4 w-4" />
          </button>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about circuits, equations, concepts..."
            rows={1}
            className="max-h-40 flex-1 resize-none bg-transparent px-2 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <button
            onClick={() => void sendMessage()}
            disabled={isLoading || (!input.trim() && !attachedImage)}
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all",
              input.trim() || attachedImage
                ? "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95"
                : "bg-secondary text-muted-foreground",
            )}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2 text-center text-[10px] text-muted-foreground">
          Enter to send • Shift+Enter for a new line • Upload images for analysis
        </p>
      </div>
    </div>
  );
}
