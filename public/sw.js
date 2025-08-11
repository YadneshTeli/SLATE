// Enhanced Service Worker for SLATE PWA with Offline Support
const CACHE_NAME = 'slate-v2';
const DATA_CACHE_NAME = 'slate-data-v1';

// Resources to cache for offline functionality
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('[SW] Install event');
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)),
      caches.open(DATA_CACHE_NAME)
    ]).then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== DATA_CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
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

// Background sync for queued requests
self.addEventListener('sync', (event) => {
  if (event.tag === 'slate-background-sync') {
    console.log('[SW] Background sync triggered');
    event.waitUntil(syncPendingRequests());
  }
});

// Sync pending requests when online
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
