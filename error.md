// ============================================================================
// INDEXEDDB HELPERS (Fixed)
// ============================================================================

const storeImageInIndexedDB = async (file: File, userId: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('UserImagesDB', 1);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('images')) {
        db.createObjectStore('images', { keyPath: 'userId' });
      }
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create the transaction inside the success callback
      const transaction = db.transaction(['images'], 'readwrite');
      const store = transaction.objectStore('images');
      
      const reader = new FileReader();
      
      reader.onload = () => {
        const imageData = {
          userId,
          imageData: reader.result as string,
          timestamp: Date.now()
        };
        
        // Put the data in the store
        const putRequest = store.put(imageData);
        
        putRequest.onsuccess = () => {
          resolve(imageData.imageData);
        };
        
        putRequest.onerror = (event) => {
          console.error('Put error:', event);
          reject(new Error('Failed to store image in IndexedDB'));
        };
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      // Start reading the file
      reader.readAsDataURL(file);
      
      // Handle transaction errors
      transaction.onerror = (event) => {
        console.error('Transaction error:', event);
        reject(new Error('IndexedDB transaction failed'));
      };
    };

    request.onerror = (event) => {
      console.error('IndexedDB open error:', event);
      reject(new Error('Failed to open IndexedDB'));
    };
  });
};