/**
 * Comprehensive toast notification helper for API responses
 * Automatically analyzes API responses and shows appropriate toast messages
 */

import { toast } from "sonner";
import { toastDeduplicator } from "./toast-deduplicator";

export interface ApiResponse<T = any> {
  isSuccess?: boolean;
  data?: T;
  message?: string;
  status?: number;
  [key: string]: any;
}

export interface ToastConfig {
  duration?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  description?: string;
}

/**
 * Shows success toast with green styling
 */
export const showSuccessToast = (
  message: string, 
  config: ToastConfig = {}
) => {
  if (!toastDeduplicator.canShowToast(message, 'success')) {
    return;
  }
  
  toastDeduplicator.markToastActive(message, 'success');
  
  toast.success(message, {
    duration: config.duration || 4000,
    description: config.description,
    className: "border-green-200 bg-green-50 text-green-800",
    style: {
      backgroundColor: "#f0fdf4",
      borderColor: "#bbf7d0",
      color: "#166534"
    },
    onDismiss: () => {
      toastDeduplicator.markToastCompleted(message, 'success');
    },
    onAutoClose: () => {
      toastDeduplicator.markToastCompleted(message, 'success');
    }
  });
};

/**
 * Shows error toast with red styling
 */
export const showErrorToast = (
  message: string, 
  config: ToastConfig = {}
) => {
  if (!toastDeduplicator.canShowToast(message, 'error')) {
    return;
  }
  
  toastDeduplicator.markToastActive(message, 'error');
  
  toast.error(message, {
    duration: config.duration || 5000,
    description: config.description,
    className: "border-red-200 bg-red-50 text-red-800",
    style: {
      backgroundColor: "#fef2f2",
      borderColor: "#fecaca",
      color: "#991b1b"
    },
    onDismiss: () => {
      toastDeduplicator.markToastCompleted(message, 'error');
    },
    onAutoClose: () => {
      toastDeduplicator.markToastCompleted(message, 'error');
    }
  });
};

/**
 * Shows warning toast with yellow styling
 */
export const showWarningToast = (
  message: string, 
  config: ToastConfig = {}
) => {
  toast.warning(message, {
    duration: config.duration || 4000,
    description: config.description,
    className: "border-yellow-200 bg-yellow-50 text-yellow-800",
    style: {
      backgroundColor: "#fffbeb",
      borderColor: "#fed7aa",
      color: "#92400e"
    }
  });
};

/**
 * Shows info toast with blue styling
 */
export const showInfoToast = (
  message: string, 
  config: ToastConfig = {}
) => {
  toast.info(message, {
    duration: config.duration || 4000,
    description: config.description,
    className: "border-blue-200 bg-blue-50 text-blue-800",
    style: {
      backgroundColor: "#eff6ff",
      borderColor: "#bfdbfe",
      color: "#1e40af"
    }
  });
};

/**
 * Shows loading toast for ongoing operations
 */
export const showLoadingToast = (
  message: string, 
  config: ToastConfig = {}
) => {
  return toast.loading(message, {
    duration: config.duration || Infinity,
    description: config.description,
    className: "border-gray-200 bg-gray-50 text-gray-800",
    style: {
      backgroundColor: "#f9fafb",
      borderColor: "#e5e7eb",
      color: "#374151"
    }
  });
};

/**
 * Automatically handles API response and shows appropriate toast
 */
export const handleApiResponse = <T = any>(
  response: ApiResponse<T>,
  options: {
    successMessage?: string;
    errorMessage?: string;
    warningMessage?: string;
    infoMessage?: string;
    context?: string; // For contextual default messages
    showDataInfo?: boolean; // Whether to show info about returned data
  } = {}
) => {
  const { successMessage, errorMessage, warningMessage, infoMessage, context, showDataInfo } = options;

  // Handle successful responses (status 200-299 or isSuccess === true)
  if (
    response.isSuccess === true || 
    (response.status && response.status >= 200 && response.status < 300) ||
    (!response.status && response.data !== undefined)
  ) {
    // Check for warnings in successful responses
    if (response.message && (
      response.message.toLowerCase().includes('warning') ||
      response.message.toLowerCase().includes('incomplete') ||
      response.message.toLowerCase().includes('partial') ||
      response.message.toLowerCase().includes('unverified') ||
      response.message.toLowerCase().includes('missing')
    )) {
      showWarningToast(
        warningMessage || response.message,
        { description: showDataInfo && response.data ? `Data received: ${JSON.stringify(response.data).substring(0, 100)}...` : undefined }
      );
      return;
    }

    // Check for info messages in successful responses
    if (response.message && (
      response.message.toLowerCase().includes('expires') ||
      response.message.toLowerCase().includes('processing') ||
      response.message.toLowerCase().includes('pending') ||
      response.message.toLowerCase().includes('will be') ||
      response.message.toLowerCase().includes('scheduled')
    )) {
      showInfoToast(
        infoMessage || response.message,
        { description: showDataInfo && response.data ? `Additional info available` : undefined }
      );
      return;
    }

    // Standard success message
    const message = successMessage || 
                   response.message || 
                   getDefaultSuccessMessage(context);
    
    showSuccessToast(message, {
      description: showDataInfo && response.data && Array.isArray(response.data) 
        ? `${response.data.length} items loaded` 
        : undefined
    });
    return;
  }

  // Handle error responses (status >= 400 or isSuccess === false)
  if (
    response.isSuccess === false ||
    (response.status && response.status >= 400) ||
    response.error
  ) {
    const message = errorMessage || 
                   response.message || 
                   response.error?.message ||
                   getDefaultErrorMessage(context, response.status);
    
    showErrorToast(message, {
      description: response.status ? `Error ${response.status}` : undefined
    });
    return;
  }

  // Fallback for unclear responses
  showInfoToast(
    infoMessage || 
    response.message || 
    getDefaultInfoMessage(context)
  );
};

/**
 * Handles API errors (for catch blocks)
 */
export const handleApiError = (
  error: any,
  options: {
    context?: string;
    customMessage?: string;
    showDetails?: boolean;
  } = {}
) => {
  const { context, customMessage, showDetails } = options;
  
  console.error(`API Error ${context ? `(${context})` : ''}:`, error);

  // Network errors
  if (error.code === "ERR_NETWORK" || error.message?.includes('Network Error')) {
    showErrorToast(
      customMessage || "Network error - please check your connection",
      { description: "Backend server may be offline" }
    );
    return;
  }

  // HTTP status errors
  if (error.response?.status) {
    const status = error.response.status;
    let message = customMessage;
    let description: string | undefined;

    if (!message) {
      switch (status) {
        case 400:
          message = "Invalid request - please check your input";
          break;
        case 401:
          message = "Authentication required - please sign in again";
          break;
        case 403:
          message = "Access denied - insufficient permissions";
          break;
        case 404:
          message = "Resource not found";
          break;
        case 409:
          message = "Conflict - resource already exists";
          break;
        case 422:
          message = "Validation error - please check your input";
          break;
        case 429:
          message = "Too many requests - please try again later";
          break;
        case 500:
          message = "Server error - please try again later";
          break;
        case 503:
          message = "Service unavailable - please try again later";
          break;
        default:
          message = `Request failed (${status})`;
      }
    }

    if (showDetails && error.response?.data?.message) {
      description = error.response.data.message;
    }

    showErrorToast(message, { description });
    return;
  }

  // Generic error fallback
  showErrorToast(
    customMessage || `Operation failed${context ? ` - ${context}` : ''}`,
    { description: showDetails ? error.message : undefined }
  );
};

/**
 * Default success messages based on context
 */
function getDefaultSuccessMessage(context?: string): string {
  if (!context) return "Operation completed successfully";
  
  const contextMessages: Record<string, string> = {
    'login': 'Welcome back! Sign in successful',
    'signin': 'Welcome back! Sign in successful',
    'register': 'Registration successful! Please check your email',
    'signup': 'Registration successful! Please check your email',
    'logout': 'Signed out successfully',
    'update': 'Information updated successfully',
    'create': 'Created successfully',
    'delete': 'Deleted successfully',
    'save': 'Saved successfully',
    'load': 'Data loaded successfully',
    'fetch': 'Data retrieved successfully',
    'upload': 'Upload completed successfully',
    'send': 'Message sent successfully',
    'verify': 'Verification successful',
    'refresh': 'Data refreshed',
    'password': 'Password updated successfully',
    'profile': 'Profile updated successfully',
    'payment': 'Payment processed successfully',
    'post': 'Post created successfully'
  };

  return contextMessages[context.toLowerCase()] || `${context} completed successfully`;
}

/**
 * Default error messages based on context and status
 */
function getDefaultErrorMessage(context?: string, status?: number): string {
  if (status === 401) return "Authentication failed - please sign in again";
  if (status === 403) return "Access denied - insufficient permissions";
  if (status === 404) return "Resource not found";
  if (status === 500) return "Server error - please try again later";
  
  if (!context) return "Operation failed - please try again";
  
  const contextMessages: Record<string, string> = {
    'login': 'Sign in failed - please check your credentials',
    'signin': 'Sign in failed - please check your credentials',
    'register': 'Registration failed - please try again',
    'signup': 'Registration failed - please try again',
    'logout': 'Sign out failed - please try again',
    'update': 'Update failed - please try again',
    'create': 'Creation failed - please try again',
    'delete': 'Deletion failed - please try again',
    'save': 'Save failed - please try again',
    'load': 'Failed to load data',
    'fetch': 'Failed to retrieve data',
    'upload': 'Upload failed - please try again',
    'send': 'Failed to send message',
    'verify': 'Verification failed',
    'refresh': 'Failed to refresh data',
    'password': 'Password update failed',
    'profile': 'Profile update failed',
    'payment': 'Payment failed',
    'post': 'Failed to create post'
  };

  return contextMessages[context.toLowerCase()] || `${context} failed - please try again`;
}

/**
 * Default info messages based on context
 */
function getDefaultInfoMessage(context?: string): string {
  if (!context) return "Operation completed";
  
  return `${context} operation completed`;
}

/**
 * Multi-step operation handler for complex workflows
 */
export class MultiStepToastHandler {
  private currentStepToast: string | number | null = null;
  private allToastIds: (string | number)[] = [];
  private steps: string[] = [];
  private currentStep = 0;
  private isCompleted = false;

  constructor(steps: string[]) {
    this.steps = steps;
  }

  startStep(stepIndex: number): void {
    if (this.isCompleted) return; // Prevent operations after completion
    
    this.currentStep = stepIndex;
    const message = this.steps[stepIndex] || `Step ${stepIndex + 1}`;
    
    // Dismiss current toast only
    if (this.currentStepToast) {
      toast.dismiss(this.currentStepToast);
    }
    
    this.currentStepToast = showLoadingToast(message, {
      description: `Step ${stepIndex + 1} of ${this.steps.length}`
    });
    
    if (this.currentStepToast) {
      this.allToastIds.push(this.currentStepToast);
    }
  }

  completeStep(stepIndex: number, successMessage?: string): void {
    if (this.isCompleted) return; // Prevent operations after completion
    
    if (this.currentStepToast) {
      toast.dismiss(this.currentStepToast);
      this.currentStepToast = null;
    }
    
    // Only show brief success for intermediate steps, not final completion
    if (stepIndex < this.steps.length - 1) {
      const message = successMessage || `${this.steps[stepIndex]} completed`;
      showSuccessToast(message, { duration: 1500 });
    }
  }

  failStep(stepIndex: number, errorMessage?: string): void {
    this.isCompleted = true; // Mark as completed to prevent further operations
    
    // Dismiss all previous toasts
    this.cleanup();
    
    const message = errorMessage || `${this.steps[stepIndex]} failed`;
    showErrorToast(message);
  }

  complete(finalMessage?: string): void {
    if (this.isCompleted) return; // Prevent duplicate completion
    
    this.isCompleted = true;
    
    // Dismiss current loading toast
    if (this.currentStepToast) {
      toast.dismiss(this.currentStepToast);
      this.currentStepToast = null;
    }
    
    // Show final success message
    if (finalMessage) {
      showSuccessToast(finalMessage, { duration: 3000 });
    }
  }

  cleanup(): void {
    this.isCompleted = true;
    
    // Dismiss current toast
    if (this.currentStepToast) {
      toast.dismiss(this.currentStepToast);
      this.currentStepToast = null;
    }
    
    // Dismiss all tracked toasts
    this.allToastIds.forEach(id => {
      try {
        toast.dismiss(id);
      } catch (e) {
        // Ignore errors when dismissing toasts
      }
    });
    
    this.allToastIds = [];
  }
}