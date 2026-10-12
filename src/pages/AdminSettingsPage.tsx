import { AdminSettings } from '../components/admin/AdminSettings';
import { PageHeader } from '../components/admin/PageHeader';

export function AdminSettingsPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-7 md:px-8 md:py-10">
      <PageHeader title="ตั้งค่าร้าน" subtitle="ข้อมูลร้านและภาพหน้าแรก" />
      <AdminSettings />
    </main>
  );
}
