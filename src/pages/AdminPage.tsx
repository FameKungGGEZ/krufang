import React, { useEffect, useState } from 'react';
import { Link, Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  FolderOpen,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  Store
} from 'lucide-react';
import { toast } from 'sonner';
import { BrandMark } from '../components/layout/BrandMark';
import { Button } from '../components/Button';
import { useAdminContext } from '../contexts/adminContext';
import { requireSupabase } from '../lib/supabase';
import { cn } from '../utils/cn';

const NAV_ITEMS: {
  to: string;
  label: string;
  icon: React.ElementType;
  count?: 'products' | 'categories';
}[] = [
  { to: '/admin/dashboard', label: 'ภาพรวม', icon: LayoutDashboard },
  { to: '/admin/products', label: 'สินค้า', icon: Package, count: 'products' },
  { to: '/admin/categories', label: 'หมวดหมู่', icon: FolderOpen, count: 'categories' },
  { to: '/admin/settings', label: 'ตั้งค่าร้าน', icon: Settings }
] as const;

export function AdminPage() {
  const navigate = useNavigate();
  const context = useAdminContext();
  const { products, categories } = context;
  const [access, setAccess] = useState<'checking' | 'allowed' | 'unauthorized' | 'forbidden' | 'error'>('checking');
  const [accessError, setAccessError] = useState('');

  useEffect(() => {
    let active = true;
    const verifyAccess = async () => {
      try {
        const client = requireSupabase();
        const { data: { session }, error: sessionError } = await client.auth.getSession();
        if (sessionError) throw sessionError;
        if (!session) {
          if (active) setAccess('unauthorized');
          return;
        }
        const { data: { user }, error: userError } = await client.auth.getUser();
        if (userError) throw userError;
        if (!user) {
          if (active) setAccess('unauthorized');
          return;
        }
        if (active) {
          setAccess(user.app_metadata?.role === 'admin' ? 'allowed' : 'forbidden');
        }
      } catch (error) {
        if (active) {
          setAccessError(error instanceof Error ? error.message : 'ตรวจสอบสิทธิ์ผู้ดูแลไม่สำเร็จ');
          setAccess('error');
        }
      }
    };
    void verifyAccess();
    return () => {
      active = false;
    };
  }, []);

  if (access === 'unauthorized') {
    return <Navigate to="/login" replace />;
  }

  if (access === 'checking' || context.loading) {
    return (
      <main className="flex min-h-[50vh] items-center justify-center px-4 text-sm text-muted-foreground">
        กำลังตรวจสอบสิทธิ์และโหลดข้อมูลจาก Supabase…
      </main>
    );
  }

  if (access === 'forbidden' || access === 'error' || context.loadError) {
    const message = access === 'forbidden'
      ? 'บัญชีนี้ยังไม่ได้รับสิทธิ์ผู้ดูแล'
      : accessError || context.loadError;
    return (
      <main className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="font-heading text-xl font-semibold">เปิดหน้าจัดการไม่ได้</h1>
        <p role="alert" className="mt-2 text-sm text-destructive">{message}</p>
        <Button className="mt-5" onClick={() => void context.reload()}>ลองโหลดข้อมูลอีกครั้ง</Button>
      </main>
    );
  }

  const logout = async () => {
    if (!window.confirm('ต้องการออกจากระบบหรือไม่?')) return;
    const { error } = await requireSupabase().auth.signOut();
    if (error) {
      toast.error(`ออกจากระบบไม่สำเร็จ: ${error.message}`);
      return;
    }
    toast('ออกจากระบบแล้ว');
    navigate('/');
  };

  const navigation = (compact = false) => (
    <nav
      aria-label="เมนูผู้ดูแล"
      className={compact ? 'flex gap-1 overflow-x-auto px-3 pb-3' : 'space-y-1 px-3'}
    >
      {NAV_ITEMS.map((item) => {
        const count = item.count === 'products'
          ? products.length
          : item.count === 'categories'
            ? categories.length
            : null;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                compact ? 'shrink-0' : 'w-full',
                isActive
                  ? 'bg-secondary text-secondary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )
            }
          >
            <item.icon className="size-4 shrink-0" aria-hidden />
            <span>{item.label}</span>
            {count !== null && (
              <span className="ml-auto rounded-md bg-white/80 px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                {count}
              </span>
            )}
          </NavLink>
        );
      })}
    </nav>
  );

  return (
      <div className="flex min-h-screen w-full bg-brand-sky/40">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r bg-white lg:flex">
          <div className="px-5 pb-6 pt-6">
            <BrandMark />
          </div>
          <div className="px-4">
            <Button
              className="h-11 w-full rounded-xl"
              onClick={() => navigate('/admin/products/new')}
            >
              <Package className="size-4" />
              เพิ่มสินค้าใหม่
            </Button>
          </div>
          <p className="px-6 pb-2 pt-7 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Studio Admin
          </p>
          {navigation()}
          <div className="mt-auto space-y-1 border-t p-4">
            <Link
              to="/"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <Store className="size-4" />
              ดูหน้าร้าน
            </Link>
            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive transition hover:bg-destructive/10"
            >
              <LogOut className="size-4" />
              ออกจากระบบ
            </button>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b bg-white/95 backdrop-blur lg:hidden">
            <div className="flex items-center justify-between px-4 py-3">
              <BrandMark compact />
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-destructive"
              >
                <LogOut className="size-4" />
                ออกจากระบบ
              </button>
            </div>
            {navigation(true)}
          </header>
          <Outlet context={context} />
        </div>
      </div>
  );
}
