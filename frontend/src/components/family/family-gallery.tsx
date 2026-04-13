"use client";

import { motion } from "framer-motion";
import { Camera, Image as ImageIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FamilyGallery() {
  // Placeholder images for the gallery
  const photos = [
    { id: 1, url: "https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=300&h=200&auto=format&fit=crop", caption: "Liburan Keluarga" },
    { id: 2, url: "https://images.unsplash.com/photo-1542037104857-ffbb0b9155fb?q=80&w=300&h=200&auto=format&fit=crop", caption: "Momen Syukuran" },
    { id: 3, url: "https://images.unsplash.com/photo-1591439657448-528400f07fa1?q=80&w=300&h=200&auto=format&fit=crop", caption: "Capaian Tabungan" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ImageIcon size={20} className="text-primary" />
          <h3 className="font-bold text-lg">Galeri Momen</h3>
        </div>
        <Button size="sm" variant="ghost" className="text-primary gap-1">
          <Plus size={16} />
          Unggah Foto
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {photos.map((photo, index) => (
          <motion.div 
            key={photo.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="group relative aspect-[3/2] rounded-xl overflow-hidden shadow-sm border"
          >
            <img 
              src={photo.url} 
              alt={photo.caption} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
              <span className="text-white text-xs font-medium">{photo.caption}</span>
            </div>
          </motion.div>
        ))}
        
        {/* Empty State / Add UI */}
        <div className="aspect-[3/2] rounded-xl border-2 border-dashed border-muted flex flex-col items-center justify-center text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors cursor-pointer">
          <Camera size={32} className="mb-2 opacity-20" />
          <span className="text-xs">Klik untuk menambah</span>
        </div>
      </div>
    </div>
  );
}
