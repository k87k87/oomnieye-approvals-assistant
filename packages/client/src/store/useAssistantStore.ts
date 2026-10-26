import { create } from "zustand";
import { ActionType, ChatMessage, StructuredSummary } from "@oomnieye/shared";
import { ApiClient } from "../services/api.client";

interface AssistantState {
  // Widget Visibility & Active View
  isWidgetOpen: boolean;
  activeView: "cards" | "chat" | "summary";
  activeAction: ActionType | null;

  // Greeting State
  greetingText: string;
  greetingDegraded: boolean;
  isGreetingLoading: boolean;

  // Structured Summary State
  structuredSummary: StructuredSummary | null;
  isSummaryLoading: boolean;

  // Chat & Streaming State
  messages: ChatMessage[];
  streamingTokenBuffer: string;
  isStreaming: boolean;
  isDegraded: boolean;
  degradedNotice: string | null;
  errorMessage: string | null;
  currentCitations: string[];
  operatorLanguage: string;

  // Actions
  toggleWidget: (open?: boolean) => void;
  loadGreeting: () => Promise<void>;
  loadSummary: () => Promise<void>;
  startAction: (action: ActionType, customPrompt?: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  backToCards: () => void;
  clearChat: () => void;
  setLanguage: (lang: string) => void;
}

export const useAssistantStore = create<AssistantState>((set, get) => ({
  isWidgetOpen: true,
  activeView: "cards",
  activeAction: null,

  greetingText: "Welcome back, Operator. Analyzing pending queue...",
  greetingDegraded: false,
  isGreetingLoading: false,

  structuredSummary: null,
  isSummaryLoading: false,

  messages: [],
  streamingTokenBuffer: "",
  isStreaming: false,
  isDegraded: false,
  degradedNotice: null,
  errorMessage: null,
  currentCitations: [],
  operatorLanguage: "en",

  toggleWidget: (open) => {
    set((state) => ({ isWidgetOpen: open !== undefined ? open : !state.isWidgetOpen }));
  },

  loadGreeting: async () => {
    set({ isGreetingLoading: true, errorMessage: null });
    try {
      const response = await ApiClient.getGreeting();
      set({
        greetingText: response.data.greeting,
        greetingDegraded: response.data.degraded,
        isGreetingLoading: false,
      });
    } catch (err) {
      console.error("[useAssistantStore] loadGreeting error:", err);
      set({
        greetingText: "Welcome back, Operator. You have 4 items pending review in the queue.",
        greetingDegraded: true,
        isGreetingLoading: false,
      });
    }
  },

  loadSummary: async () => {
    set({
      isSummaryLoading: true,
      activeView: "summary",
      activeAction: "summary",
      errorMessage: null,
    });
    try {
      const response = await ApiClient.getSummary(get().operatorLanguage);
      set({
        structuredSummary: response.data,
        isSummaryLoading: false,
        isDegraded: response.data.degraded,
      });
    } catch (err) {
      console.error("[useAssistantStore] loadSummary error:", err);
      set({
        errorMessage: "Unable to generate summary. Showing static queue status.",
        isSummaryLoading: false,
      });
    }
  },

  startAction: async (action, customPrompt) => {
    if (action === "summary") {
      await get().loadSummary();
      return;
    }

    if (action === "greeting") {
      await get().loadGreeting();
      return;
    }

    // Switch to Chat View
    set({
      activeView: "chat",
      activeAction: action,
      messages: [],
      streamingTokenBuffer: "",
      isStreaming: true,
      isDegraded: false,
      degradedNotice: null,
      errorMessage: null,
      currentCitations: [],
    });

    const initialUserMessage =
      customPrompt ||
      (action === "talk"
        ? "Which of these needs my attention first and why?"
        : action === "help"
          ? "What are the approval criteria for drone patrol videos and sensor specs?"
          : "Walk me step-by-step through how to review an approval request.");

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: initialUserMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    set({ messages: [userMsg] });

    let accumulatedText = "";
    let isDegradedResult = false;
    let finalCitations: string[] = [];

    await ApiClient.streamAssistantAction({
      action,
      message: initialUserMessage,
      history: [],
      language: get().operatorLanguage,
      onToken: (token, degraded, citations) => {
        accumulatedText += token;
        if (degraded) isDegradedResult = true;
        if (citations && citations.length > 0) finalCitations = citations;

        set({
          streamingTokenBuffer: accumulatedText,
          isDegraded: isDegradedResult,
          currentCitations: finalCitations,
        });
      },
      onComplete: () => {
        const assistantMsg: ChatMessage = {
          id: `asst-${Date.now()}`,
          role: "assistant",
          content: accumulatedText,
          citations: finalCitations,
          degraded: isDegradedResult,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        set({
          messages: [...get().messages, assistantMsg],
          streamingTokenBuffer: "",
          isStreaming: false,
        });
      },
      onError: (err) => {
        console.error("[useAssistantStore] Stream error:", err);
        const fallbackMsg: ChatMessage = {
          id: `asst-err-${Date.now()}`,
          role: "assistant",
          content:
            "*(Notice: Connection delay encountered. Operational fallback displayed below)*\n\nPlease refer to the Approvals Table and standard SOP checklist for immediate action.",
          degraded: true,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        set({
          messages: [...get().messages, fallbackMsg],
          streamingTokenBuffer: "",
          isStreaming: false,
          isDegraded: true,
          errorMessage: err.message,
        });
      },
    });
  },

  sendMessage: async (content) => {
    if (!content.trim() || get().isStreaming) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const updatedMessages = [...get().messages, userMsg];
    set({
      messages: updatedMessages,
      streamingTokenBuffer: "",
      isStreaming: true,
      errorMessage: null,
    });

    let accumulatedText = "";
    let isDegradedResult = false;
    let finalCitations: string[] = [];

    const activeAction = get().activeAction || "talk";

    await ApiClient.streamAssistantAction({
      action: activeAction,
      message: content,
      history: updatedMessages,
      language: get().operatorLanguage,
      onToken: (token, degraded, citations) => {
        accumulatedText += token;
        if (degraded) isDegradedResult = true;
        if (citations && citations.length > 0) finalCitations = citations;

        set({
          streamingTokenBuffer: accumulatedText,
          isDegraded: isDegradedResult,
          currentCitations: finalCitations,
        });
      },
      onComplete: () => {
        const assistantMsg: ChatMessage = {
          id: `asst-${Date.now()}`,
          role: "assistant",
          content: accumulatedText,
          citations: finalCitations,
          degraded: isDegradedResult,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        set({
          messages: [...get().messages, assistantMsg],
          streamingTokenBuffer: "",
          isStreaming: false,
        });
      },
      onError: (err) => {
        set({
          isStreaming: false,
          errorMessage: err.message,
        });
      },
    });
  },

  backToCards: () => {
    set({
      activeView: "cards",
      activeAction: null,
      streamingTokenBuffer: "",
      isStreaming: false,
      errorMessage: null,
    });
  },

  clearChat: () => {
    set({
      messages: [],
      streamingTokenBuffer: "",
      isStreaming: false,
    });
  },

  setLanguage: (lang) => {
    set({ operatorLanguage: lang });
  },
}));
