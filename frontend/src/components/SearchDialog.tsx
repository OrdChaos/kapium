import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search, Clock, X } from 'lucide-react';
import { Link } from 'wouter';
import MiniSearch from 'minisearch';

interface SearchResult {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  content?: string;
  tags?: string[];
}

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STORAGE_KEY = 'searchHistory';
const MAX_HISTORY = 10;

export default function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [miniSearch, setMiniSearch] = useState<MiniSearch | null>(null);

  useEffect(() => {
    const history = localStorage.getItem(STORAGE_KEY);
    if (history) {
      setSearchHistory(JSON.parse(history));
    }

    fetch('/data/searchResults.json')
      .then((res) => res.json())
      .then((data) => {
        setResults(data);
        
        const ms = new MiniSearch({
          fields: ['title', 'excerpt', 'content', 'category', 'tags'],
          storeFields: ['title', 'excerpt', 'category', 'tags', 'originalId', 'content'],
          searchOptions: {
            boost: { title: 3, excerpt: 2, tags: 2, category: 1, content: 1 },
            fuzzy: (term: string) => term.length > 6 ? 0.1 : 0,
            prefix: (term: string) => term.length > 2,
            combineWith: 'AND',
          },
          tokenize: (string: string) => {
            const words = string.split(/[\s\-\.\,，。、；：？！\(\)\[\]【】「」『』《》〈〉""''""'']+/);
            const chineseChars = string.match(/[\u4e00-\u9fa5]/g) || [];
            return [...words, ...chineseChars].filter(Boolean);
          },
        });

        ms.addAll(data.map((item: SearchResult, idx: number) => ({
          id: idx.toString(),
          originalId: item.id,
          title: item.title,
          excerpt: item.excerpt,
          category: item.category,
          tags: item.tags || [],
          content: item.content || '',
        })));

        setMiniSearch(ms);
      })
      .catch((err) => {
        console.error('Failed to load search data:', err);
        setResults([]);
      });
  }, []);

  const extractRelevantSnippet = (content: string, query: string): string => {
    if (!content) return '';
    
    const lowerContent = content.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerContent.indexOf(lowerQuery);
    
    if (index === -1) return '';
    
    const start = Math.max(0, index - 50);
    const end = Math.min(content.length, index + query.length + 100);
    
    let snippet = content.slice(start, end);
    
    if (start > 0) snippet = '...' + snippet;
    if (end < content.length) snippet = snippet + '...';
    
    return snippet;
  };

  const searchResults = useMemo(() => {
    if (!searchQuery || !searchQuery.trim() || !miniSearch) return [];
    
    try {
      const rawResults = miniSearch.search(searchQuery.trim());
      
      return rawResults.map((result) => {
        const resultData = result as any;
        let displayExcerpt = resultData.excerpt;
        
        const snippet = extractRelevantSnippet(resultData.content || '', searchQuery);
        if (snippet) {
          displayExcerpt = snippet;
        }
        
        return {
          id: resultData.originalId,
          title: resultData.title,
          excerpt: displayExcerpt,
          category: resultData.category,
          tags: resultData.tags,
        };
      });
    } catch (e) {
      console.error('Search error:', e);
      return [];
    }
  }, [searchQuery, miniSearch]);

  const fallbackResults = useMemo(() => {
    if (!searchQuery || !searchQuery.trim()) return [];
    
    const trimmedQuery = searchQuery.trim().toLowerCase();
    if (trimmedQuery.length === 0) return [];
    
    const filtered = results.filter((result) => {
      const titleMatch = result.title.toLowerCase().includes(trimmedQuery);
      const excerptMatch = result.excerpt.toLowerCase().includes(trimmedQuery);
      const contentMatch = result.content && result.content.toLowerCase().includes(trimmedQuery);
      return titleMatch || excerptMatch || contentMatch;
    });
    
    return filtered.map((result) => {
      let displayExcerpt = result.excerpt;
      const snippet = extractRelevantSnippet(result.content || '', searchQuery);
      if (snippet) {
        displayExcerpt = snippet;
      }
      return { ...result, excerpt: displayExcerpt };
    });
  }, [searchQuery, results]);

  const displayResults = useMemo(() => {
    if (!searchQuery || !searchQuery.trim()) return [];
    
    if (searchResults.length > 0 && searchResults.length < results.length) {
      return searchResults;
    }
    
    if (fallbackResults.length > 0 && fallbackResults.length < results.length) {
      return fallbackResults;
    }
    
    return [];
  }, [searchResults, fallbackResults, searchQuery, results]);

  const addToHistory = (query: string) => {
    if (!query.trim()) return;
    
    const filtered = searchHistory.filter(h => h !== query);
    const newHistory = [query, ...filtered].slice(0, MAX_HISTORY);
    
    setSearchHistory(newHistory);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const removeFromHistory = (query: string) => {
    const newHistory = searchHistory.filter(h => h !== query);
    setSearchHistory(newHistory);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
  };

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    
    const words = query.split(/\s+/).filter(Boolean);
    if (words.length === 0) return text;
    
    try {
      const regex = new RegExp(`(${words.join('|')})`, 'gi');
      const parts = text.split(regex);
      
      return parts.map((part, i) => 
        words.some(w => w.toLowerCase() === part.toLowerCase()) 
          ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">{part}</mark>
          : part
      );
    } catch {
      return text;
    }
  };

  const handleResultClick = () => {
    if (searchQuery.trim()) {
      addToHistory(searchQuery.trim());
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>搜索文章</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="请输入关键词开始搜索"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {!searchQuery && searchHistory.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">搜索历史</span>
                <button
                  onClick={clearHistory}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  清空
                </button>
              </div>
              <div className="space-y-1">
                {searchHistory.map((query, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg p-2 hover:bg-muted cursor-pointer"
                    onClick={() => setSearchQuery(query)}
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{query}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromHistory(query);
                      }}
                      className="opacity-0 group-hover:opacity-100 hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {searchQuery && (
            <div className="max-h-96 space-y-2 overflow-y-auto p-1 scrollbar-search">
              {displayResults.length > 0 ? (
                displayResults.map((result) => (
                  <Link
                    key={result.id}
                    href={`/posts/${result.id}`}
                    onClick={handleResultClick}
                    className="block rounded-lg border border-border p-4 transition-all duration-300 hover:shadow-lg hover:border-primary/50 bg-card"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <h3 className="font-semibold">{highlightText(result.title, searchQuery)}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{highlightText(result.excerpt, searchQuery)}</p>
                  </Link>
                ))
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  未找到相关文章
                </div>
              )}
            </div>
          )}

          {!searchQuery && searchHistory.length === 0 && (
            <div className="py-8 text-center text-muted-foreground">
              请输入关键词开始搜索
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}