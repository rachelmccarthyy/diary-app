import { createClient } from './supabase';

function supabase() { return createClient(); }

export interface Letter {
  id: string;
  subject: string;
  body: string;
  deliverAt: string;
  delivered: boolean;
  createdAt: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToLetter(row: any): Letter {
  return {
    id: row.id,
    subject: row.subject,
    body: row.body,
    deliverAt: row.deliver_at,
    delivered: row.delivered,
    createdAt: row.created_at,
  };
}

export async function getLetters(userId: string): Promise<Letter[]> {
  const { data, error } = await supabase()
    .from('letters')
    .select('*')
    .eq('user_id', userId)
    .order('deliver_at', { ascending: true });

  if (error) throw error;
  return (data ?? []).map(rowToLetter);
}

export async function getLetter(id: string): Promise<Letter | null> {
  const { data, error } = await supabase()
    .from('letters')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return rowToLetter(data);
}

export async function createLetter(
  userId: string,
  data: { subject: string; body: string; deliverAt: string }
): Promise<Letter> {
  const { data: row, error } = await supabase()
    .from('letters')
    .insert({
      user_id: userId,
      subject: data.subject,
      body: data.body,
      deliver_at: data.deliverAt,
    })
    .select()
    .single();

  if (error) throw error;
  return rowToLetter(row);
}

export async function deleteLetter(id: string): Promise<void> {
  const { error } = await supabase()
    .from('letters')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Check and mark letters as delivered (client-side check)
export async function checkDeliveries(userId: string): Promise<Letter[]> {
  const now = new Date().toISOString();

  const { data, error } = await supabase()
    .from('letters')
    .update({ delivered: true })
    .eq('user_id', userId)
    .eq('delivered', false)
    .lte('deliver_at', now)
    .select();

  if (error) throw error;
  return (data ?? []).map(rowToLetter);
}
