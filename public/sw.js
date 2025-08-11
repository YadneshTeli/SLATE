// Enhanced Service Worker for SLATE PWA with Comprehensive Offline Support
const CACHE_NAME = 'slate-v3';
const DATA_CACHE_NAME = 'slate-data-v2';
const STATIC_CACHE_NAME = 'slate-static-v2';

// Enhanced resources to cache for offline functionality
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico'
];

// Static assets patterns to cache
const STATIC_ASSET_PATTERNS = [
  /\.js$/,
  /\.css$/,
  /\.woff2?$/,
  /\.ttf$/,
  /\.eot$/,
  /\.svg$/,
  /\.png$/,
  /\.jpg$/,
  /\.jpeg$/,
  /\.webp$/
];

// Background sync tags
const SYNC_TAGS = {
  DATA_SYNC: 'data-sync',
  SHOT_COMPLETION: 'shot-completion',
  USER_ACTIONS: 'user-actions'
};

// Install event - cache resources and register background sync
self.addEventListener('install', (event) => {
  console.log('[SW] Install event');
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then(async (cache) => {
        // Cache URLs individually to handle failures gracefully
        const cachePromises = urlsToCache.map(async (url) => {
          try {
            const response = await fetch(url);
            if (response.ok) {
              return cache.put(url, response);
            } else {
              console.warn(`[SW] Failed to cache ${url}: ${response.status}`);
            }
          } catch (error) {
            console.warn(`[SW] Failed to cache ${url}:`, error);
          }
        });
        await Promise.allSettled(cachePromises);
        console.log('[SW] Main cache populated');
      }),
      caches.open(DATA_CACHE_NAME),
      caches.open(STATIC_CACHE_NAME)
    ]).then(() => {
      console.log('[SW] All caches created successfully');
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches and claim clients
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && 
              cacheName !== DATA_CACHE_NAME && 
              cacheName !== STATIC_CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Service worker activated and claiming clients');
      return self.clients.claim();
    })
  );
});

// Enhanced fetch event with offline-first strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Handle different types of requests
  if (request.method === 'GET') {
    // For navigation requests (HTML pages)
    if (request.mode === 'navigate') {
      event.respondWith(handleNavigationRequest(request));
    }
    // For API requests
    else if (url.pathname.startsWith('/api/')) {
      event.respondWith(handleApiRequest(request));
    }
    // For static assets
    else {
      event.respondWith(handleStaticRequest(request));
    }
  }
  // For POST/PUT/DELETE requests (data modifications)
  else if (['POST', 'PUT', 'DELETE'].includes(request.method)) {
    event.respondWith(handleDataModificationRequest(request));
  }
});

// Handle navigation requests (pages)
async function handleNavigationRequest(request) {
  try {
    // Try network first for navigation
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      return networkResponse;
    }
    throw new Error('Network response not ok');
  } catch (error) {
    console.log('[SW] Network failed for navigation, serving from cache');
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    // Last resort - serve index.html for SPA
    return caches.match('/index.html');
  }
}

// Handle API requests with cache-first strategy for offline support
async function handleApiRequest(request) {
  const cache = await caches.open(DATA_CACHE_NAME);
  
  try {
    // Try network first
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Cache successful responses
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    throw new Error('Network response not ok');
  } catch (error) {
    console.log('[SW] Network failed for API, serving from cache:', request.url);
    // Fallback to cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    // Return offline indicator
    return new Response(
      JSON.stringify({ 
        error: 'Offline', 
        message: 'No cached data available',
        offline: true 
      }),
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle static assets with cache-first strategy
async function handleStaticRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  
  try {
    // Skip unsupported schemes
    const url = new URL(request.url);
    if (url.protocol === 'chrome-extension:' || url.protocol === 'moz-extension:' || url.protocol === 'safari-extension:') {
      return fetch(request);
    }
    
    // Check cache first
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback to network
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Cache new static assets
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Failed to serve static asset:', request.url);
    // For essential files, try to serve index.html
    if (request.url.includes('.js') || request.url.includes('.css')) {
      return caches.match('/index.html');
    }
    return new Response('Offline', { status: 503 });
  }
}

// Handle data modification requests (POST/PUT/DELETE)
async function handleDataModificationRequest(request) {
  try {
    // Try network first for data modifications
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Invalidate related cache entries
      await invalidateRelatedCache(request);
      return networkResponse;
    }
    throw new Error('Network response not ok');
  } catch (error) {
    console.log('[SW] Network failed for data modification, queuing for sync');
    // Queue for background sync
    await queueForBackgroundSync(request);
    
    // Return optimistic response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Queued for sync when online',
        queued: true 
      }),
      { 
        status: 202,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Invalidate cache entries related to the modified data
async function invalidateRelatedCache(request) {
  const cache = await caches.open(DATA_CACHE_NAME);
  const url = new URL(request.url);
  
  // Invalidate related API endpoints
  if (url.pathname.includes('/projects')) {
    await cache.delete('/api/projects');
  }
  if (url.pathname.includes('/checklists')) {
    await cache.delete('/api/checklists');
  }
  if (url.pathname.includes('/shots')) {
    await cache.delete('/api/shots');
  }
}

// Queue requests for background sync using IndexedDB
async function queueForBackgroundSync(request) {
  return new Promise((resolve, reject) => {
    const dbRequest = indexedDB.open('slate-sync-queue', 1);
    
    dbRequest.onerror = () => reject(dbRequest.error);
    
    dbRequest.onsuccess = async () => {
      const db = dbRequest.result;
      const transaction = db.transaction(['pending-requests'], 'readwrite');
      const store = transaction.objectStore('pending-requests');
      
      // Clone request body before any operations if it exists
      let bodyData = null;
      try {
        if (request.body && !request.bodyUsed) {
          const clonedRequest = request.clone();
          bodyData = await clonedRequest.text();
        }
      } catch (error) {
        console.log('[SW] Could not clone request body:', error);
        bodyData = null;
      }
      
      const requestData = {
        id: Date.now(),
        url: request.url,
        method: request.method,
        headers: Object.fromEntries(request.headers.entries()),
        body: bodyData,
        timestamp: new Date().toISOString()
      };
      
      store.add(requestData);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    };
    
    dbRequest.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pending-requests')) {
        const store = db.createObjectStore('pending-requests', { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp');
      }
    };
  });
}

// Enhanced Background sync for queued requests
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered for tag:', event.tag);
  
  switch (event.tag) {
    case SYNC_TAGS.DATA_SYNC:
      event.waitUntil(syncPendingData());
      break;
    case SYNC_TAGS.SHOT_COMPLETION:
      event.waitUntil(syncShotCompletions());
      break;
    case SYNC_TAGS.USER_ACTIONS:
      event.waitUntil(syncUserActions());
      break;
    default:
      // Legacy sync support
      if (event.tag === 'slate-background-sync') {
        event.waitUntil(syncPendingRequests());
      }
      break;
  }
});

// Sync all pending data changes
async function syncPendingData() {
  try {
    const db = await openSyncDB();
    const pendingItems = await getAllPendingItems(db, 'data-changes');
    console.log('[SW] Syncing', pendingItems.length, 'data changes');
    
    for (const item of pendingItems) {
      try {
        const response = await fetch('/api/sync/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.data)
        });
        
        if (response.ok) {
          await removePendingItem(db, 'data-changes', item.id);
          console.log('[SW] Successfully synced data item:', item.id);
        }
      } catch (error) {
        console.error('[SW] Failed to sync data item:', item.id, error);
        // Increment retry count
        await updateRetryCount(db, 'data-changes', item.id);
      }
    }
  } catch (error) {
    console.error('[SW] Data sync failed:', error);
  }
}

// Sync shot completion status
async function syncShotCompletions() {
  try {
    const db = await openSyncDB();
    const completions = await getAllPendingItems(db, 'shot-completions');
    console.log('[SW] Syncing', completions.length, 'shot completions');
    
    for (const completion of completions) {
      try {
        const response = await fetch('/api/shots/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(completion.data)
        });
        
        if (response.ok) {
          await removePendingItem(db, 'shot-completions', completion.id);
          console.log('[SW] Successfully synced shot completion:', completion.id);
        }
      } catch (error) {
        console.error('[SW] Failed to sync shot completion:', completion.id, error);
        await updateRetryCount(db, 'shot-completions', completion.id);
      }
    }
  } catch (error) {
    console.error('[SW] Shot completion sync failed:', error);
  }
}

// Helper functions for background sync
function openSyncDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('slate-sync-queue', 2);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create stores for different types of sync data
      if (!db.objectStoreNames.contains('data-changes')) {
        const store = db.createObjectStore('data-changes', { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp');
        store.createIndex('retryCount', 'retryCount');
      }
      
      if (!db.objectStoreNames.contains('shot-completions')) {
        const store = db.createObjectStore('shot-completions', { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp');
      }
      
      if (!db.objectStoreNames.contains('user-actions')) {
        const store = db.createObjectStore('user-actions', { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp');
      }
      
      // Legacy store for backward compatibility
      if (!db.objectStoreNames.contains('pending-requests')) {
        db.createObjectStore('pending-requests', { keyPath: 'id' });
      }
    };
  });
}

function getAllPendingItems(db, storeName) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function removePendingItem(db, storeName, itemId) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(itemId);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

function updateRetryCount(db, storeName, itemId) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const getRequest = store.get(itemId);
    
    getRequest.onsuccess = () => {
      const item = getRequest.result;
      if (item) {
        item.retryCount = (item.retryCount || 0) + 1;
        item.lastRetry = Date.now();
        
        const updateRequest = store.put(item);
        updateRequest.onerror = () => reject(updateRequest.error);
        updateRequest.onsuccess = () => resolve();
      } else {
        resolve();
      }
    };
    
    getRequest.onerror = () => reject(getRequest.error);
  });
}
async function syncPendingRequests() {
  return new Promise((resolve, reject) => {
    const dbRequest = indexedDB.open('slate-sync-queue', 1);
    
    dbRequest.onsuccess = () => {
      const db = dbRequest.result;
      const transaction = db.transaction(['pending-requests'], 'readwrite');
      const store = transaction.objectStore('pending-requests');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = async () => {
        const pendingRequests = getAllRequest.result;
        console.log('[SW] Syncing', pendingRequests.length, 'pending requests');
        
        for (const requestData of pendingRequests) {
          try {
            const response = await fetch(requestData.url, {
              method: requestData.method,
              headers: requestData.headers,
              body: requestData.body
            });
            
            if (response.ok) {
              // Remove successfully synced request
              store.delete(requestData.id);
              console.log('[SW] Synced request:', requestData.url);
            }
          } catch (error) {
            console.log('[SW] Failed to sync request:', requestData.url, error);
          }
        }
        
        resolve();
      };
      
      getAllRequest.onerror = () => reject(getAllRequest.error);
    };
    
    dbRequest.onerror = () => reject(dbRequest.error);
  });
}

// Listen for messages from the main app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'REGISTER_SYNC') {
    // Register background sync
    self.registration.sync.register('slate-background-sync');
  }
});
