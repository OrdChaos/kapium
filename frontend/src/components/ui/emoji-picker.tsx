import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { customCategories, loadEmojis } from '@/lib/emojis';

interface StickerEmoji {
  id: string;
  name: string;
  skins: { src: string }[];
}

interface StickerPickerProps {
  onSelect: (emojiId: string) => void;
}

export const StickerPicker: React.FC<StickerPickerProps> = ({ onSelect }) => {
  const [activeTab, setActiveTab] = useState<string>(customCategories[0]?.id || '');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadEmojis().then(() => {
      if (customCategories.length > 0) {
        setActiveTab(customCategories[0].id);
        setLoaded(true)
      }
    })
  }, [])

  const currentEmojis = useMemo<StickerEmoji[]>(() => {
    return customCategories.find((c) => c.id === activeTab)?.emojis || [];
  }, [activeTab]);

  if (!loaded || customCategories.length === 0) return null;

  return (
    <div className="w-80 flex flex-col bg-popover border border-border rounded-xl shadow-xl overflow-hidden select-none font-sans text-sm">
      <nav className="flex items-center border-b border-border bg-background px-1 overflow-x-auto no-scrollbar">
        {customCategories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveTab(cat.id)}
            className={`relative flex-shrink-0 px-4 py-3 text-xs font-medium transition-colors ${
              activeTab === cat.id 
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="relative z-10">{cat.name}</span>
            
            {activeTab === cat.id && (
              <motion.div
                layoutId="active-underline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
              />
            )}
          </button>
        ))}
      </nav>

      <div className="relative h-60 overflow-y-auto overflow-x-hidden p-2 custom-scrollbar bg-background/50">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -5 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="grid grid-cols-6 gap-1"
          >
            {currentEmojis.map((emoji) => (
              <button
                key={emoji.id}
                type="button"
                onClick={() => onSelect(`:${emoji.id}:`)}
                title={emoji.name}
                className="group relative flex aspect-square items-center justify-center rounded-lg hover:bg-accent transition-all active:scale-90"
              >
                <img
                  src={emoji.skins[0].src}
                  alt={emoji.name}
                  loading="lazy"
                  className="w-8 h-8 object-contain pointer-events-none transition-transform group-hover:scale-110"
                />
              </button>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="px-3 py-1 text-[10px] text-muted-foreground bg-muted/10 border-t border-border/50 flex justify-between uppercase tracking-tighter">
        <span>{activeTab}</span>
        <span>{currentEmojis.length} Stickers</span>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: hsl(var(--muted-foreground) / 0.2); 
          border-radius: 10px; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { 
          background: hsl(var(--muted-foreground) / 0.4); 
        }
      `}} />
    </div>
  );
};