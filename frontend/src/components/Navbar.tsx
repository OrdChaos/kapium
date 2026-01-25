import { Link, useLocation } from 'wouter';
import { Menu, X, Moon, Sun, Search, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

interface NavbarProps {
  onSearchClick?: () => void;
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
  { href: '/links', label: '友链' },
  { href: '/about', label: '关于' },
];

export default function Navbar({ onSearchClick }: NavbarProps) {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<number, boolean>>({});

  useEffect(() => {
    try {
      const ls = localStorage.getItem('theme');
      const cookieMatch = document.cookie.match(/(?:^|; )theme=(dark|light)(?:;|$)/);
      const cookie = cookieMatch ? cookieMatch[1] : null;

      if (ls) setIsDark(ls === 'dark');
      else if (cookie) setIsDark(cookie === 'dark');
      else setIsDark(document.documentElement.classList.contains('dark'));
    } catch {
      setIsDark(document.documentElement.classList.contains('dark'));
    }
  }, []);

  const toggleTheme = () => {
    const willDark = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', willDark);
    setIsDark(willDark);

    try {
      localStorage.setItem('theme', willDark ? 'dark' : 'light');
      document.cookie = `theme=${willDark ? 'dark' : 'light'}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {}
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold tracking-tight text-foreground">
            {import.meta.env.VITE_SITE_TITLE}
          </Link>

          {/* ================= Desktop ================= */}
          <div className="hidden md:flex items-center gap-4">
            {navItems.map((item, idx) => {
              const isActive =
                item.href === location ||
                item.children?.some((c) => c.href === location);

              if (item.children) {
                return (
                  <div key={item.label} className="relative group">
                    {/* 母项 */}
                    <div
                      className={`
                        flex items-center gap-1 pl-1 pr-[2px] py-1
                        text-sm font-medium cursor-pointer select-none
                        transition-colors
                        hover:text-primary
                        ${isActive ? 'text-foreground' : 'text-muted-foreground'}
                      `}
                    >
                      <span>{item.label}</span>
                      <ChevronDown className="h-3 w-3 transition-transform group-hover:rotate-180" />
                    </div>

                    {/* 子菜单 */}
                    <div className="absolute left-0 top-full w-24 pt-[2px] opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity">
                      <div className="rounded-md border border-border bg-card shadow-md py-2">
                        {item.children.map((c) => (
                          <Link
                            key={c.href}
                            href={c.href}
                            className="block px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
                          >
                            {c.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href!}
                  className={`
                    flex items-center pl-1 pr-[2px] py-1
                    text-sm font-medium
                    transition-colors
                    hover:text-primary
                    ${isActive ? 'text-foreground' : 'text-muted-foreground'}
                  `}
                >
                  {item.label}
                </Link>
              );
            })}

            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={onSearchClick}>
                <Search className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* ================= Mobile Buttons ================= */}
          <div className="flex items-center gap-2 md:hidden">
            <Button variant="ghost" size="icon" onClick={onSearchClick}>
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* ================= Mobile Menu ================= */}
        {isOpen && (
          <div className="border-t border-border/40 py-3 md:hidden">
            <div className="flex flex-col">
              {navItems.map((item, idx) => {
                const isActive =
                  item.href === location ||
                  item.children?.some((c) => c.href === location);

                if (item.children) {
                  return (
                    <div key={item.label}>
                      <button
                        onClick={() =>
                          setOpenMenus((s) => ({ ...s, [idx]: !s[idx] }))
                        }
                        className={`
                          w-full flex items-center justify-between
                          pl-2 pr-[6px] py-2 mb-1
                          text-sm font-medium text-left
                          transition-colors
                          hover:text-primary
                          ${isActive ? 'text-foreground' : 'text-muted-foreground'}
                        `}
                      >
                        <span>{item.label}</span>
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${
                            openMenus[idx] ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {openMenus[idx] && (
                        <div className="flex flex-col pl-2 mb-3">
                          {item.children.map((c) => (
                            <Link
                              key={c.href}
                              href={c.href}
                              onClick={() => setIsOpen(false)}
                              className="block pl-2 pr-[6px] py-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                            >
                              {c.label}
                            </Link>
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
                    className={`
                      block pl-2 pr-[6px] py-2 mb-1
                      text-sm font-medium
                      transition-colors
                      hover:text-primary
                      ${isActive ? 'text-foreground' : 'text-muted-foreground'}
                    `}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
