import supabase from './supabaseClient';

export async function fetchDriveJournal() {
  const { data, error } = await supabase.from('DriveJournal').select('*');
  if (error) throw error;
  return data;
}

export async function addDriveEntry(entry: any) {
  const { data, error } = await supabase.from('DriveJournal').insert([entry]);
  if (error) throw error;
  return data;
}