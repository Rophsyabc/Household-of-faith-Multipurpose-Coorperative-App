import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { DirectoryClient } from './directory-client';

export const dynamic = 'force-dynamic';

export default async function MembersDirectoryPage() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { get(name: string) { return cookieStore.get(name)?.value; } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/auth');

    const { data: members } = await supabase
        .from('profiles')
        .select('id, full_name, email, kyc_status, occupation')
        .order('full_name', { ascending: true });

    return (
        <DirectoryClient members={members || []} />
    );
}
