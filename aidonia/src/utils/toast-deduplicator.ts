/**
 * Global state manager for preventing duplicate toasts
 */

class ToastDeduplicator {
  private activeToasts = new Set<string>();
  private recentToasts = new Map<string, number>();
  private readonly TOAST_COOLDOWN = 3000; // 3 seconds cooldown

  /**
   * Check if a toast with the same message should be shown
   * @param message - The toast message
   * @param type - Type of toast (success, error, warning, info)
   * @returns true if toast should be shown, false if duplicate
   */
  canShowToast(message: string, type: string = 'default'): boolean {
    const key = `${type}:${message}`;
    const now = Date.now();
    
    // Check if this exact toast is currently active
    if (this.activeToasts.has(key)) {
      return false;
    }
    
    // Check if this toast was shown recently
    const lastShown = this.recentToasts.get(key);
    if (lastShown && (now - lastShown) < this.TOAST_COOLDOWN) {
      return false;
    }
    
    return true;
  }

  /**
   * Mark a toast as active
   * @param message 
   * @param type 
   */
  markToastActive(message: string, type: string = 'default'): void {
    const key = `${type}:${message}`;
    this.activeToasts.add(key);
    this.recentToasts.set(key, Date.now());
  }

  /**
   * Mark a toast as completed
   * @param message 
   * @param type 
   */
  markToastCompleted(message: string, type: string = 'default'): void {
    const key = `${type}:${message}`;
    this.activeToasts.delete(key);
  }

  /**
   * Clear old entries from recent toasts
   */
  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    this.recentToasts.forEach((timestamp, key) => {
      if (now - timestamp > this.TOAST_COOLDOWN * 2) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => {
      this.recentToasts.delete(key);
    });
  }

  /**
   * Clear all toast state (useful for testing or reset)
   */
  reset(): void {
    this.activeToasts.clear();
    this.recentToasts.clear();
  }
}

export const toastDeduplicator = new ToastDeduplicator();

// Auto cleanup every 10 seconds
if (typeof window !== 'undefined') {
  setInterval(() => {
    toastDeduplicator.cleanup();
  }, 10000);
}