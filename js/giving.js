// js/giving.js

async function createGiving({ amount, type, date, notes }) {
  if (!navigator.onLine) {
    console.log("Device offline. Saving to offline queue...");
    if (window.offlineManager) {
      await window.offlineManager.saveGivingOffline({ amount, type, date: date || new Date().toISOString().split('T')[0], notes });
      return { offline: true };
    }
  }

  const session = await getSession();
  if (!session) throw new Error("Not authenticated");

  const { data, error } = await db.from('giving_entries').insert({
    user_id: session.user.id,
    amount, 
    type, 
    date: date || new Date().toISOString().split('T')[0], 
    notes
  });

  if (error) {
    if (window.offlineManager) {
      await window.offlineManager.saveGivingOffline({ amount, type, date: date || new Date().toISOString().split('T')[0], notes });
      return { offline: true };
    }
    throw error;
  }
  return data;
}

async function getGivings({ startDate, endDate, type } = {}) {
  let query = db.from('giving_entries')
    .select('*')
    .order('date', { ascending: false });
    
  if (startDate) query = query.gte('date', startDate);
  if (endDate)   query = query.lte('date', endDate);
  if (type)      query = query.eq('type', type);
  
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

async function deleteGiving(id) {
  const { error } = await db.from('giving_entries').delete().eq('id', id);
  if (error) throw error;
  return true;
}
