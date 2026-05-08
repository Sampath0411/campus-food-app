import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Sparkles, Utensils, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getAIRecommendation, chatWithAI, ChatMessage, smartSearch } from "@/lib/groq";
import { useNavigate } from "react-router-dom";

interface AIConciergeProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideFab?: boolean;
}

export function AIConcierge({ open: controlledOpen, onOpenChange, hideFab }: AIConciergeProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = (v: boolean) => {
    if (onOpenChange) onOpenChange(v);
    else setInternalOpen(v);
  };
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hey! I'm your QuickBite AI food buddy 🍕 What are you craving today?",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Check if it's a search query
      if (input.toLowerCase().includes("show") || input.toLowerCase().includes("find")) {
        const results = await smartSearch(input);

        if (results.restaurants.length > 0) {
          const aiResponse: ChatMessage = {
            role: "assistant",
            content: `Found ${results.restaurants.length} places matching "${input}"! Check the search page for details.`,
            timestamp: Date.now(),
          };
          setMessages((prev) => [...prev, aiResponse]);
          navigate("/search");
        } else {
          const aiResponse: ChatMessage = {
            role: "assistant",
            content: "Hmm, couldn't find exact matches. Try different keywords like 'biryani', 'pizza', or 'veg'!",
            timestamp: Date.now(),
          };
          setMessages((prev) => [...prev, aiResponse]);
        }
      } else {
        // Get AI recommendation
        const recommendation = await getAIRecommendation(input);

        const aiResponse: ChatMessage = {
          role: "assistant",
          content: recommendation.message,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, aiResponse]);

        // Navigate to restaurant if matched
        if (recommendation.restaurantId && recommendation.confidence > 0.8) {
          // Could navigate to specific restaurant page in future
        }
      }
    } catch (err) {
      const errorResponse: ChatMessage = {
        role: "assistant",
        content: "Having trouble right now. Try asking about food recommendations!",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
  };

  const quickPrompts = [
    "🍕 Suggest something under ₹150",
    "🥗 Healthy options near me",
    "🌶️ Spicy biryani recommendations",
    "🌙 Late night delivery",
  ];

  return (
    <>
      {/* Floating AI Button */}
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "fixed z-50 rounded-full p-4 shadow-pop transition-all hover:scale-110",
          "bg-gradient-primary text-primary-foreground",
          open ? "bottom-4 right-4 opacity-0 pointer-events-none" : "bottom-6 right-6"
        )}
        aria-label="Open AI Concierge"
      >
        <MessageCircle className="h-6 w-6" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <Sparkles className="h-4 w-4 text-yellow-300" />
        </span>
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed inset-x-0 bottom-0 z-50 md:inset-auto md:bottom-6 md:right-6 md:w-96">
          <div className="mx-4 mb-4 flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl md:mx-0">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border bg-gradient-primary p-4 text-primary-foreground">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-white/20">
                  <Utensils className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">QuickBite AI</h3>
                  <p className="text-xs opacity-80">Your food concierge</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full p-1 hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex max-h-[400px] min-h-[300px] flex-col gap-3 overflow-y-auto p-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex max-w-[85%] flex-col gap-1 rounded-2xl px-3 py-2 text-sm",
                    msg.role === "user"
                      ? "ml-auto bg-primary text-primary-foreground"
                      : "mr-auto bg-muted"
                  )}
                >
                  {msg.content}
                  <span
                    className={cn(
                      "text-[10px]",
                      msg.role === "user" ? "opacity-70" : "text-muted-foreground"
                    )}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))}
              {loading && (
                <div className="mr-auto flex items-center gap-2 rounded-2xl bg-muted px-3 py-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Thinking...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            {!loading && messages.length < 3 && (
              <div className="flex gap-2 overflow-x-auto border-t border-border px-4 py-2">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleQuickPrompt(prompt)}
                    className="whitespace-nowrap rounded-full bg-muted px-3 py-1 text-xs hover:bg-muted/80"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="flex items-center gap-2 border-t border-border p-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask about food..."
                className="h-10 rounded-full bg-background"
                disabled={loading}
              />
              <Button
                size="icon"
                className="rounded-full"
                onClick={handleSend}
                disabled={loading || !input.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
