import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { StaffShell } from '@/components/staff-shell';

export const metadata: Metadata = {
  title: 'Staff Dashboard — RashtraTimes'
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <StaffShell>{children}</StaffShell>;
}
