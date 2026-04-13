"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface SuccessStateProps {
  message?: string
  className?: string
}

export function SuccessState({ message = "Barakallah, Berhasil Disimpan", className }: SuccessStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center", className)}>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
        }}
        className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-deep/10 text-emerald-deep"
      >
        <Check className="h-10 w-10" strokeWidth={3} />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 flex flex-col gap-2"
      >
        <span className="font-display text-2xl font-bold text-emerald-deep tracking-tight">
          Bismillah
        </span>
        <p className="text-sm font-medium text-muted-foreground">
          {message}
        </p>
      </motion.div>
    </div>
  )
}
