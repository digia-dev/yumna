"use client"

import * as React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface SakinahContextType {
  isSakinahMode: boolean
  toggleSakinahMode: () => void
}

const SakinahContext = createContext<SakinahContextType | undefined>(undefined)

export function SakinahProvider({ children }: { children: React.ReactNode }) {
  const [isSakinahMode, setIsSakinahMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("yumna_sakinah_mode") === "true";
    }
    return false;
  });

  // Effect to handle side effects of mode change
  useEffect(() => {
    const className = "sakinah-mode";
    if (isSakinahMode) {
      document.body.classList.add(className);
    } else {
      document.body.classList.remove(className);
    }
  }, [isSakinahMode]);

  const toggleSakinahMode = () => {
    const newVal = !isSakinahMode
    setIsSakinahMode(newVal)
    localStorage.setItem("yumna_sakinah_mode", String(newVal))
  }

  return (
    <SakinahContext.Provider value={{ isSakinahMode, toggleSakinahMode }}>
      <div className={isSakinahMode ? "sakinah-mode" : ""}>
        {children}
      </div>
    </SakinahContext.Provider>
  )
}

export function useSakinah() {
  const context = useContext(SakinahContext)
  if (context === undefined) {
    throw new Error("useSakinah must be used within a SakinahProvider")
  }
  return context
}
