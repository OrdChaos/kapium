interface EmojiCategory {
  id: string;
  name: string;
  emojis: {
    id: string;
    name: string;
    skins: { src: string }[];
  }[];
}

export const customCategories: EmojiCategory[] = [];

export const loadEmojis = async (): Promise<EmojiCategory[]> => {
  try {
    const response = await fetch('/emojis.json');
    if (response.ok) {
      const data = await response.json();
      customCategories.length = 0;
      customCategories.push(...data);
      return data;
    }
  } catch (error) {
    console.error('Failed to load emojis:', error);
  }
  return customCategories;
};
