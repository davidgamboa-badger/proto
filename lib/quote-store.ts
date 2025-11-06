import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Part, subtotalFromParts } from "./pricing";

export type Quote = {
  id: string;
  parts: Part[];
  subtotal: number;
  notes?: string;
};

type QuoteState = {
  quotes: Record<string, Quote>;
  currentQuoteId: string | null;
  createQuoteFromParts: (parts: Part[]) => string; // returns id
  updateQuoteParts: (id: string, parts: Part[]) => void;
  getQuote: (id: string) => Quote | undefined;
  clearQuote: (id: string) => void;
};

const genId = () => `QUOTE-${Date.now()}`;

export const useQuoteStore = create<QuoteState>()(
  persist(
    (set, get) => ({
      quotes: {},
      currentQuoteId: null,

      createQuoteFromParts: (parts) => {
        const id = genId();
        const subtotal = subtotalFromParts(parts);
        const quote: Quote = { id, parts, subtotal };
        set((s) => ({
          quotes: { ...s.quotes, [id]: quote },
          currentQuoteId: id,
        }));
        return id;
      },

      updateQuoteParts: (id, parts) => {
        set((s) => {
          const existing = s.quotes[id];
          if (!existing) return s;
          const updated: Quote = {
            ...existing,
            parts,
            subtotal: subtotalFromParts(parts),
          };
          return { quotes: { ...s.quotes, [id]: updated } };
        });
      },

      getQuote: (id) => get().quotes[id],

      clearQuote: (id) => set((s) => {
        const next = { ...s.quotes };
        delete next[id];
        return { quotes: next, currentQuoteId: s.currentQuoteId === id ? null : s.currentQuoteId };
      }),
    }),
    {
      name: "quote-store",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ quotes: state.quotes, currentQuoteId: state.currentQuoteId }),
    }
  )
);


