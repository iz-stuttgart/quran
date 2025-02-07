import nightwind from 'nightwind/helper';

// Function to initialize nightwind
export function initNightwind() {
  // Check if we're in the browser
  if (typeof window !== 'undefined') {
    // Initialize nightwind
    nightwind.init();
  }
}