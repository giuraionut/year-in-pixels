'use client';

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from 'react';

type SelectedContext = {
  selected: Set<string>;
  toggle: (id: string) => void;
  clearSelection: () => void;
};

const SelectedTableItemsContext = createContext<SelectedContext | null>(null);

export function SelectedTableItemsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = useCallback((id: string) => {
    setSelected((prev: Set<string>) => { 
      const next = new Set(prev); 
  
      if (next.has(id)) {
        next.delete(id); 
      } else {
        next.add(id); 
      }
  
      return next; 
    });
  }, [setSelected]); 

  const clearSelection = useCallback(() => {
    setSelected(new Set());
  }, []);

  const value = { selected, toggle, clearSelection };

  return (
    <SelectedTableItemsContext.Provider value={value}>
      {children}
    </SelectedTableItemsContext.Provider>
  );
}

export function useSelectedItems(): SelectedContext {
  const ctx = useContext(SelectedTableItemsContext);
  if (!ctx) {
    throw new Error(
      'useSelectedItems must be used within a SelectedTableItemsProvider'
    );
  }
  return ctx;
}
