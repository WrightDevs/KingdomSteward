// js/offline.js

class OfflineGivingManager {
  constructor() {
    this.dbName = 'KingdomStewardDB';
    this.dbVersion = 1;
    this.db = null;
    this.initDB();
  }
  
  async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('offlineGiving')) {
          const store = db.createObjectStore('offlineGiving', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          store.createIndex('timestamp', 'timestamp');
        }
      };
    });
  }
  
  async saveGivingOffline(givingData) {
    if (!this.db) await this.initDB();
    
    // Also save to the Service Worker Cache for the Background Sync to pick it up
    if ('caches' in window) {
      const cache = await caches.open('offline-giving');
      const req = new Request(`/offline-giving/${Date.now()}`);
      
      // Inject current session token so SW can authenticate the POST request
      const sessionResponse = await db.auth.getSession();
      const session = sessionResponse.data.session;
      if (session) {
        givingData._token = session.access_token;
        givingData.user_id = session.user.id;
      }
      
      await cache.put(req, new Response(JSON.stringify(givingData)));
      
      // Register sync event
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        const registration = await navigator.serviceWorker.ready;
        try {
          await registration.sync.register('sync-giving');
          console.log('Background sync registered!');
        } catch (err) {
          console.error('Background sync registration failed:', err);
        }
      }
    }

    const transaction = this.db.transaction(['offlineGiving'], 'readwrite');
    const store = transaction.objectStore('offlineGiving');
    
    const entry = {
      ...givingData,
      timestamp: new Date().toISOString(),
      synced: false
    };
    
    return store.add(entry);
  }
  
  async getOfflineGiving() {
    if (!this.db) await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['offlineGiving'], 'readonly');
      const store = transaction.objectStore('offlineGiving');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  
  async syncOfflineGiving() {
    const offlineEntries = await this.getOfflineGiving();
    
    for (const entry of offlineEntries) {
      try {
        const { data, error } = await db.from('giving_entries').insert({
          amount: entry.amount,
          type: entry.type,
          date: entry.date,
          notes: entry.notes,
          user_id: entry.user_id
        });
        
        if (!error) {
          // Remove synced entry
          const transaction = this.db.transaction(['offlineGiving'], 'readwrite');
          const store = transaction.objectStore('offlineGiving');
          store.delete(entry.id);
        }
      } catch (error) {
        console.log('Still offline, keeping in queue', error);
      }
    }
  }
}

const offlineManager = new OfflineGivingManager();

window.addEventListener('online', () => {
  console.log('Back online! Syncing...');
  offlineManager.syncOfflineGiving();
});
