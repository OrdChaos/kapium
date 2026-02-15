import { Link, useLocation } from 'wouter';
import {
  Menu,
  X,
  Moon,
  Sun,
  Search,
  ChevronDown,
  Rss,
  Dice5,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

interface NavbarProps {
  onSearchClick?: () => void;
  postIds: string[];
}

type NavItem = {
  href?: string;
  label: string;
  children?: { href: string; label: string }[];
};

const navItems: NavItem[] = [
  { href: '/', label: '首页' },
  {
    label: '归档',
    children: [
      { href: '/categories', label: '分类' },
      { href: '/tags', label: '标签' },
      { href: '/timeline', label: '时间线' },
    ],
  },
  {
    label: '朋友们',
    children: [
      { href: '/links', label: '友链' },
      { href: 'https://out.ordchaos.com/travellings', label: '开往' },
      { href: 'https://out.ordchaos.com/wormhole', label: '虫洞' },
    ],
  },
  { href: '/about', label: '关于' },
];

export default function Navbar({ onSearchClick, postIds }: NavbarProps) {
  const [location, navigate] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<number, boolean>>({});

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    const willDark = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', willDark);
    setIsDark(willDark);
    localStorage.setItem('theme', willDark ? 'dark' : 'light');
  };

  const goRandomPost = () => {
    if (!postIds.length) return;
    const random = postIds[Math.floor(Math.random() * postIds.length)];
    navigate(`/posts/${random}`);
    setIsOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link href="/" className="text-xl font-bold tracking-tight">
            {import.meta.env.VITE_SITE_TITLE}
          </Link>

          <div className="hidden md:flex items-center gap-4">
            {navItems.map((item, idx) => {
              const isActive =
                item.href === location ||
                item.children?.some((c) => c.href === location);

              if (item.children) {
                return (
                  <div key={item.label} className="relative group">
                    <div
                      className={`flex items-center gap-1 text-sm font-medium cursor-pointer transition-colors hover:text-primary ${
                        isActive
                          ? 'text-foreground'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {item.label}
                      <ChevronDown className="h-3 w-3 group-hover:rotate-180 transition-transform" />
                    </div>

                    <div className="absolute left-1/2 -translate-x-1/2 top-full hidden group-hover:block bg-card border rounded-md shadow-md py-2 z-50 w-20">
                      {item.children.map((c) => (
                        <a
                          key={c.href}
                          href={c.href}
                          target={
                            c.href.startsWith('http') ? '_blank' : undefined
                          }
                          rel={
                            c.href.startsWith('http')
                              ? 'noopener noreferrer'
                              : undefined
                          }
                          className="block px-4 py-1.5 text-sm text-muted-foreground whitespace-nowrap text-center hover:text-primary"
                        >
                          {c.label}
                        </a>
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href!}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            <div className="flex items-center gap-1">

              <Button variant="ghost" size="icon" onClick={onSearchClick}>
                <Search className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={goRandomPost}
                disabled={!postIds.length}
              >
                <Dice5 className="h-5 w-5" />
              </Button>

              <Button variant="ghost" size="icon" asChild>
                <Link href="/feed">
                  <Rss className="h-5 w-5" />
                </Link>
              </Button>

              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                {isDark ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 md:hidden">

            <Button variant="ghost" size="icon" onClick={onSearchClick}>
              <Search className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {isOpen && (
          <div className="border-t border-border/40 py-3 md:hidden">
            <div className="flex flex-col">

              {navItems.map((item, idx) => {
                const isActive =
                  item.href === location ||
                  item.children?.some((c) => c.href === location);

                if (item.children) {
                  return (
                    <div key={item.label} className="mb-1">
                      <button
                        onClick={() =>
                          setOpenMenus((s) => ({
                            ...s,
                            [idx]: !s[idx],
                          }))
                        }
                        className={`w-full flex items-center justify-between py-2 text-sm font-medium text-left transition-colors hover:text-primary ${
                          isActive
                            ? 'text-foreground'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {item.label}
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${
                            openMenus[idx] ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {openMenus[idx] && (
                        <div className="flex flex-col pl-3">
                          {item.children.map((c) => (
                            <a
                              key={c.href}
                              href={c.href}
                              target={
                                c.href.startsWith('http')
                                  ? '_blank'
                                  : undefined
                              }
                              rel={
                                c.href.startsWith('http')
                                  ? 'noopener noreferrer'
                                  : undefined
                              }
                              onClick={() => setIsOpen(false)}
                              className="block py-2 text-sm text-muted-foreground hover:text-primary"
                            >
                              {c.label}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href!}
                    onClick={() => setIsOpen(false)}
                    className={`block py-2 text-sm font-medium transition-colors hover:text-primary ${
                      isActive
                        ? 'text-foreground'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}

              {/* 分隔线 */}
              <div className="border-t border-border/40 my-3" />

              {/* 移动端功能按钮 */}
              <div className="flex gap-2">

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goRandomPost}
                  disabled={!postIds.length}
                >
                  <Dice5 className="h-5 w-5" />
                </Button>

                <Button variant="ghost" size="icon" asChild>
                  <Link href="/feed">
                    <Rss className="h-5 w-5" />
                  </Link>
                </Button>

                <Button variant="ghost" size="icon" onClick={toggleTheme}>
                  {isDark ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </Button>

              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
