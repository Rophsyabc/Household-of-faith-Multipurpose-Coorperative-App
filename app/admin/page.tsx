import { redirect } from 'next/navigation';

/**
 * /admin — canonical admin entry point.
 * Immediately redirects to /dashboard/admin where the full admin panel lives.
 * Authentication and admin-role checks are enforced in /dashboard/admin/page.tsx.
 */
export default function AdminEntryPage() {
    redirect('/dashboard/admin');
}
