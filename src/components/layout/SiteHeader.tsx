import React, { useRef } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { BrandMark } from './BrandMark';
import { scrollToSection } from '../../utils/format';

const NAV = [
{ label: 'หน้าแรก', target: 'top' },
{ label: 'หมวดหมู่', target: 'categories' },
{ label: 'สินค้า', target: 'products' },
{ label: 'เกี่ยวกับเรา', target: 'about' }];


export function SiteHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const clicks = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const onHome = location.pathname === '/';
  const query = onHome ? params.get('q') ?? '' : '';

  const handleLogoClick = () => {
    clicks.current += 1;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => clicks.current = 0, 2000);
    if (clicks.current >= 5) {
      clicks.current = 0;
      navigate('/login');
    } else if (!onHome) {
      navigate('/');
    }
  };

  const goTo = (target: string) => {
    const run = () => target === 'top' ? window.scrollTo({ top: 0, behavior: 'smooth' }) : scrollToSection(target);
    if (onHome) run();else
    {
      navigate('/');
      setTimeout(run, 80);
    }
  };

  const onSearch = (value: string) => {
    navigate(value ? `/?q=${encodeURIComponent(value)}` : '/', { replace: onHome });
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 md:px-8">
        <BrandMark onLogoClick={handleLogoClick} />
        <nav aria-label="เมนูหลัก" className="ml-auto hidden items-center gap-1 lg:flex">
          {NAV.map((item) =>
          <button
            key={item.target}
            type="button"
            onClick={() => goTo(item.target)}
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-secondary-foreground">
            
              {item.label}
            </button>
          )}
        </nav>
        <label className="relative ml-auto w-full max-w-[220px] lg:ml-0">
          <span className="sr-only">ค้นหาสินค้า</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="ค้นหาสินค้า..."
            className="h-10 w-full rounded-full border bg-muted pl-9 pr-4 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/15" />
          
        </label>
        <Link to="/" className="sr-only">
          กลับหน้าแรก
        </Link>
      </div>
    </header>);

}