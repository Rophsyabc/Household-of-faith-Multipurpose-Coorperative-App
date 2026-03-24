'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';

async function getSupabase() {
    const cookieStore = await cookies();
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { get(name: string) { return cookieStore.get(name)?.value; } } }
    );
}

function getAdminSupabase() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

export async function submitKyc(formData: FormData) {
    const supabase = await getSupabase();
    const adminSupabase = getAdminSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Unauthorized' };

    const fullName = formData.get('fullName') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const nin = formData.get('nin') as string;
    const dateOfBirth = formData.get('dateOfBirth') as string; // Added
    const stateOfOrigin = formData.get('stateOfOrigin') as string;
    const lga = formData.get('lga') as string;
    const address = formData.get('address') as string;
    const occupation = formData.get('occupation') as string;
    const workAddress = formData.get('workAddress') as string;
    const nextOfKinName = formData.get('nextOfKinName') as string;
    const nextOfKinPhone = formData.get('nextOfKinPhone') as string;
    const nextOfKinAddress = formData.get('nextOfKinAddress') as string;

    const livePhoto = formData.get('livePhoto') as File;
    const idCard = formData.get('idCard') as File;

    try {
        const photoExt = livePhoto.name.split('.').pop();
        const photoPath = `live-photos/${user.id}-${Date.now()}.${photoExt}`;
        const { error: photoError } = await adminSupabase.storage
            .from('kyc-documents')
            .upload(photoPath, livePhoto);
        
        if (photoError) throw photoError;

        const idExt = idCard.name.split('.').pop();
        const idPath = `id-cards/${user.id}-${Date.now()}.${idExt}`;
        const { error: idError } = await adminSupabase.storage
            .from('kyc-documents')
            .upload(idPath, idCard);

        if (idError) throw idError;

        const { data: { publicUrl: photoUrl } } = adminSupabase.storage.from('kyc-documents').getPublicUrl(photoPath);
        const { data: { publicUrl: idUrl } } = adminSupabase.storage.from('kyc-documents').getPublicUrl(idPath);

        const { error: profileError } = await adminSupabase
            .from('profiles')
            .update({ 
                full_name: fullName,
                email: email,
                phone: phone,
                nin: nin,
                date_of_birth: dateOfBirth, // Added
                address: address,
                state_of_origin: stateOfOrigin,
                lga: lga,
                occupation: occupation,
                work_address: workAddress,
                next_of_kin_name: nextOfKinName,
                next_of_kin_phone: nextOfKinPhone,
                next_of_kin_address: nextOfKinAddress,
                kyc_status: 'pending',
                live_photo_url: photoUrl,
                id_document_url: idUrl,
                updated_at: new Date().toISOString()
            })
            .eq('id', user.id);

        if (profileError) throw profileError;

        revalidatePath('/dashboard/profile');
        return { success: true };

    } catch (err: any) {
        return { error: err.message || 'Failed to submit KYC' };
    }
}

export async function updateProfile(formData: FormData) {
    const supabase = await getSupabase();
    const adminSupabase = getAdminSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    const fullName = formData.get('full_name') as string;
    const phone = formData.get('phone') as string;
    const address = formData.get('address') as string;
    const occupation = formData.get('occupation') as string;
    const workAddress = formData.get('work_address') as string;
    const profilePhoto = formData.get('profile_photo') as File;

    try {
        let livePhotoUrl = null;
        if (profilePhoto && profilePhoto.size > 0) {
            const ext = profilePhoto.name.split('.').pop();
            const path = `avatars/${user.id}/${Date.now()}.${ext}`;
            const { error: uploadError } = await adminSupabase.storage
                .from('kyc-documents')
                .upload(path, profilePhoto);
            
            if (uploadError) throw uploadError;
            const { data: { publicUrl } } = adminSupabase.storage.from('kyc-documents').getPublicUrl(path);
            livePhotoUrl = publicUrl;
        }

        const updateData: any = { 
            full_name: fullName,
            phone: phone,
            address: address,
            occupation: occupation,
            work_address: workAddress,
            updated_at: new Date().toISOString(),
        };

        if (livePhotoUrl) {
            updateData.live_photo_url = livePhotoUrl;
        }

        const { error } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', user.id);

        if (error) throw error;

        revalidatePath('/dashboard/profile');
        return { success: true };
    } catch (err: any) {
        return { error: err.message || 'Failed to update profile' };
    }
}

export async function deleteAccount() {
    const supabase = await getSupabase();
    const adminSupabase = getAdminSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return { error: 'Unauthorized' };

    // Use admin client to delete from auth.users (requires a trigger or direct call if allowed)
    // Since we have delete_own_account function in SQL:
    const { error } = await supabase.rpc('delete_own_account');

    if (error) return { error: error.message };

    await supabase.auth.signOut();
    redirect('/auth');
}

export async function addBankAccount(formData: FormData) {
    const supabase = await getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    const bank_name = formData.get('bank_name') as string;
    const account_number = formData.get('account_number') as string;
    const account_name = formData.get('account_name') as string;

    const { error } = await supabase.from('bank_accounts').insert({
        user_id: user.id,
        bank_name,
        account_number,
        account_name
    });

    if (error) return { error: error.message };
    revalidatePath('/dashboard/profile');
    return { success: true };
}

export async function deleteBankAccount(id: string) {
    const supabase = await getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    const { error } = await supabase
        .from('bank_accounts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) return { error: error.message };
    revalidatePath('/dashboard/profile');
    return { success: true };
}
