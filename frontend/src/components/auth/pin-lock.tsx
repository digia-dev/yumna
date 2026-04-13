"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Delete, Fingerprint, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export function PinLock() {
  const [pin, setPin] = useState<string>("");
  const [isLocked, setIsLocked] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Basic logic: if user is logged in, show PIN lock on certain conditions
    // For demo, we auto-lock after 5 mins of inactivity or manual trigger
    const lockStatus = localStorage.getItem("yumna_app_locked") === "true";
    if (lockStatus && user) {
      setIsLocked(true);
    }
  }, [user]);

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      setPin(pin + num);
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

  useEffect(() => {
    if (pin.length === 4) {
      // Validate PIN (In real app, compare with stored hashed PIN)
      if (pin === "1234") { // Demo PIN
        setIsLocked(false);
        localStorage.setItem("yumna_app_locked", "false");
        setPin("");
      } else {
        setPin(""); // Reset if wrong
      }
    }
  }, [pin]);

  const handleBiometric = async () => {
    try {
      // Check if WebAuthn is supported
      if (!window.PublicKeyCredential) {
        toast.error("Biometrik tidak didukung di perangkat ini.");
        return;
      }

      // In a real app, you would call navigator.credentials.get() here
      // For Demo/PWA showcase, we simulate the biometric success
      toast.info("Memverifikasi Sidik Jari/Wajah...");
      
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Success simulation
      setIsLocked(false);
      localStorage.setItem("yumna_app_locked", "false");
      toast.success("Akses Biometrik Berhasil!");
    } catch (error) {
      toast.error("Gagal verifikasi biometrik.");
    }
  };

  if (!isLocked) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center p-6"
      >
        <div className="flex flex-col items-center space-y-8 w-full max-w-xs">
          <div className="flex flex-col items-center space-y-2">
            <div className="p-4 bg-primary/10 rounded-full text-primary mb-2">
              <Lock size={40} />
            </div>
            <h2 className="text-2xl font-bold font-display">Aplikasi Terkunci</h2>
            <p className="text-muted-foreground text-sm">Masukkan PIN atau Biometrik</p>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-4 py-4">
            {[...Array(4)].map((_, i) => (
              <div 
                key={i} 
                className={`w-4 h-4 rounded-full border-2 border-primary transition-all duration-200 ${
                  pin.length > i ? "bg-primary scale-110" : "bg-transparent"
                }`} 
              />
            ))}
          </div>

          {/* Number Pad */}
          <div className="grid grid-cols-3 gap-4 w-full">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
              <Button 
                key={num} 
                variant="ghost" 
                className="h-16 text-2xl font-bold rounded-full hover:bg-primary/10"
                onClick={() => handleKeyPress(num)}
              >
                {num}
              </Button>
            ))}
            <Button 
              variant="ghost" 
              className="h-16 rounded-full text-emerald-deep hover:bg-emerald-light/10"
              onClick={handleBiometric}
            >
              <Fingerprint size={28} />
            </Button>
            <Button 
              variant="ghost" 
              className="h-16 text-2xl font-bold rounded-full hover:bg-primary/10"
              onClick={() => handleKeyPress("0")}
            >
              0
            </Button>
            <Button 
              variant="ghost" 
              className="h-16 rounded-full hover:bg-destructive/10 text-destructive"
              onClick={handleDelete}
            >
              <Delete size={24} />
            </Button>
          </div>

          <Button variant="link" className="text-primary text-xs uppercase tracking-widest font-bold">
            Lupa PIN Keamanan?
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
