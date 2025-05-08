import supabase from './supabaseClient';

export async function fetchGlossGrowth() {
  const { data, error } = await supabase.from('GlossGrowth').select('*');
  if (error) throw error;
  return data;
}

export async function addGlossEvent(event: any) {
  const { data, error } = await supabase.from('GlossGrowth').insert([event]);
  if (error) throw error;
  return data;
}