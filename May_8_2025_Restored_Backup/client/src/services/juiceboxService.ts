import supabase from './supabaseClient';

export async function fetchJuiceBox() {
  const { data, error } = await supabase.from('JuiceBox').select('*');
  if (error) throw error;
  return data;
}

export async function addJuiceBoxProduct(product: any) {
  const { data, error } = await supabase.from('JuiceBox').insert([product]);
  if (error) throw error;
  return data;
}