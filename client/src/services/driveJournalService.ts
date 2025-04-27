import supabase from './supabaseClient';

export interface DriveEntry {
  id?: number;
  user_id?: string;
  date: string;
  car: string;
  location: string;
  mileage: string;
  treadDepth: string;
  weather: string;
  mood?: string;
  notes: string;
  photoUrl?: string;
}

export async function fetchDriveJournal(): Promise<DriveEntry[]> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user || !user.user) {
      // Return empty array if not authenticated
      return [];
    }

    const { data, error } = await supabase
      .from('DriveJournal')
      .select('*')
      .eq('user_id', user.user.id)
      .order('date', { ascending: false });
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching drive journal:', error);
    return [];
  }
}

export async function addDriveEntry(entry: DriveEntry): Promise<DriveEntry> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user || !user.user) {
      throw new Error('User not authenticated');
    }

    // Add user_id to entry
    const entryWithUser = { ...entry, user_id: user.user.id };
    
    const { data, error } = await supabase
      .from('DriveJournal')
      .insert(entryWithUser)
      .select()
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  } catch (error) {
    console.error('Error adding drive entry:', error);
    throw error;
  }
}

export async function deleteDriveEntry(id: number): Promise<void> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user || !user.user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('DriveJournal')
      .delete()
      .eq('id', id)
      .eq('user_id', user.user.id);
    
    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Error deleting drive entry:', error);
    throw error;
  }
}