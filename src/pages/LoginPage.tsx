import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2, LockKeyhole } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Label } from '../components/Label';
import { requireSupabase } from '../lib/supabase';
import { useAdminContext } from '../contexts/adminContext';

export function LoginPage() {
  const navigate = useNavigate();
  const { reload } = useAdminContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');
    try {
      const client = requireSupabase();
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (!data.user) throw new Error('เข้าสู่ระบบไม่สำเร็จ');

      if (data.user.app_metadata?.role !== 'admin') {
        await client.auth.signOut();
        throw new Error('บัญชีนี้ยังไม่ได้รับสิทธิ์ผู้ดูแล');
      }
      await reload();
      toast.success('เข้าสู่ระบบสำเร็จ');
      navigate('/admin');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      setStatus('error');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-brand-sky px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border bg-white p-8 shadow-soft">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <LockKeyhole className="size-6" />
        </span>
        <h1 className="mt-5 text-center font-heading text-2xl font-medium">เข้าสู่ระบบแอดมิน</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">พื้นที่สำหรับผู้ดูแล Kru.Fang Studio เท่านั้น</p>

        <form onSubmit={onSubmit} className="mt-7 space-y-4">
          {status === 'error' &&
          <div role="alert" className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              {errorMessage || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'}
            </div>
          }
          <div className="space-y-2">
            <Label htmlFor="admin-email">อีเมลผู้ดูแล</Label>
            <Input
              id="admin-email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@krufang.studio"
              className="h-11" />
            
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-pass">รหัสผ่าน</Label>
            <Input
              id="admin-pass"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="รหัสผ่านบัญชีผู้ดูแล"
              className="h-11" />
            
          </div>
          <Button type="submit" size="lg" className="h-11 w-full rounded-xl" disabled={status === 'loading'}>
            {status === 'loading' && <Loader2 className="size-4 animate-spin" />}
            {status === 'loading' ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่ระบบ'}
          </Button>
        </form>

        <p className="mt-5 text-center text-xs text-muted-foreground">เข้าสู่ระบบด้วยบัญชีผู้ดูแลของ Supabase</p>
        <Link to="/" className="mt-4 block text-center text-sm font-medium text-primary hover:underline">
          ← กลับหน้าเว็บไซต์
        </Link>
      </div>
    </div>);

}