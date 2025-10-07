/**
 * Debug utilities for development
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const debugLog = {
  auth: (message: string, data?: any) => {
    if (isDevelopment) {
      console.log(`🔐 AUTH: ${message}`, data ? data : '');
    }
  },
  
  error: (message: string, error?: any) => {
    if (isDevelopment) {
      console.error(`❌ ERROR: ${message}`, error ? error : '');
    }
  },
  
  info: (message: string, data?: any) => {
    if (isDevelopment) {
      console.log(`ℹ️ INFO: ${message}`, data ? data : '');
    }
  },
  
  success: (message: string, data?: any) => {
    if (isDevelopment) {
      console.log(`✅ SUCCESS: ${message}`, data ? data : '');
    }
  },
  
  warn: (message: string, data?: any) => {
    if (isDevelopment) {
      console.warn(`⚠️ WARN: ${message}`, data ? data : '');
    }
  }
};