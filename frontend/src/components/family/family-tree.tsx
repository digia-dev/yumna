"use client";

import { motion } from "framer-motion";
import { User, Shield, Star, Heart } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TreeMember {
  id: string;
  name: string;
  role: string;
  status?: string;
}

interface FamilyTreeProps {
  members: TreeMember[];
}

export function FamilyTree({ members }: FamilyTreeProps) {
  const headOfFamily = members.find(m => m.role === "KEPALA_KELUARGA");
  const otherMembers = members.filter(m => m.role !== "KEPALA_KELUARGA");

  return (
    <div className="relative py-12 flex flex-col items-center">
      {/* Connector lines (Simplified) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-primary/50 to-transparent" />

      {/* Head of Family */}
      {headOfFamily && (
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative z-10 flex flex-col items-center mb-24"
        >
          <div className="relative">
            <Avatar className="w-20 h-20 border-4 border-primary shadow-lg">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                {headOfFamily.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-2 -right-2 p-1.5 bg-primary text-white rounded-full shadow-lg">
              <Shield size={16} />
            </div>
          </div>
          <div className="mt-4 text-center">
            <h3 className="font-bold text-lg">{headOfFamily.name}</h3>
            <span className="text-xs uppercase tracking-widest text-primary font-bold">Kepala Keluarga</span>
          </div>
        </motion.div>
      )}

      {/* Other Members */}
      <div className="flex flex-wrap justify-center gap-12 w-full max-w-4xl">
        {otherMembers.map((member, index) => (
          <motion.div 
            key={member.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="flex flex-col items-center"
          >
            <Avatar className="w-16 h-16 border-2 border-muted shadow-md">
              <AvatarFallback className="bg-muted text-muted-foreground text-lg">
                {member.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="mt-3 text-center">
              <p className="font-semibold text-sm">{member.name}</p>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{member.role}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
