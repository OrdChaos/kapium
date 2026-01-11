import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Link } from 'wouter';

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    fetch('/data/searchResults.json')
      .then((res) => res.json())
      .then((data) => setResults(data))
      .catch(() => setResults([]));
  }, []);

  const filteredResults = searchQuery
    ? results.filter(
        (result) =>
          result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          result.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>搜索文章</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="输入关键词搜索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>

          {searchQuery && (
            <div className="max-h-96 space-y-2 overflow-y-auto p-1">
              {filteredResults.length > 0 ? (
                filteredResults.map((result) => (
                  <Link
                    key={result.id}
                    href={`/posts/${result.id}`}
                    onClick={() => onOpenChange(false)}
                    className="block rounded-lg border border-border p-4 transition-all duration-300 hover:shadow-lg hover:border-primary/50 bg-card"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <h3 className="font-semibold">{result.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{result.excerpt}</p >
                  </Link>
                ))
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  未找到相关文章
                </div>
              )}
            </div>
          )}

          {!searchQuery && (
            <div className="py-8 text-center text-muted-foreground">
              请输入关键词开始搜索
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}