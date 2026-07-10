import { toast as sonnerToast, ExternalToast } from 'sonner';

// Toast type definitions
type ToastType = 'success' | 'error' | 'warning' | 'info' | 'default';

// Default duration in milliseconds
const DEFAULT_DURATION = 5000;

/**
 * Success Toast
 * Green border, checkmark icon
 * Use for: "Job saved successfully!", "Search completed! 45 jobs found."
 */
export const toastSuccess = (message: string, options?: ExternalToast) => {
  return sonnerToast.success(message, {
    duration: DEFAULT_DURATION,
    ...options,
  });
};

/**
 * Error Toast
 * Red border, x-circle icon
 * Use for: "Failed to connect to server.", "Invalid search parameters."
 */
export const toastError = (message: string, options?: ExternalToast) => {
  return sonnerToast.error(message, {
    duration: DEFAULT_DURATION,
    ...options,
  });
};

/**
 * Warning Toast
 * Yellow border, alert-triangle icon
 * Use for: "Session about to expire.", "Max keywords limit reached (20)."
 */
export const toastWarning = (message: string, options?: ExternalToast) => {
  return sonnerToast(message, {
    duration: DEFAULT_DURATION,
    ...options,
    icon: '⚠️',
  });
};

/**
 * Info Toast
 * Blue border, info icon
 * Use for: "New jobs available.", "Search is running in background."
 */
export const toastInfo = (message: string, options?: ExternalToast) => {
  return sonnerToast.info(message, {
    duration: DEFAULT_DURATION,
    ...options,
  });
};

/**
 * Loading Toast
 * Spinner icon, auto-persist until dismissed
 */
export const toastLoading = (message: string, options?: ExternalToast) => {
  return sonnerToast.loading(message, {
    duration: Infinity,
    ...options,
  });
};

/**
 * Promise Toast
 * Shows loading, then success/error based on promise result
 */
export const toastPromise = <T,>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: unknown) => string);
  },
  options?: ExternalToast
) => {
  return sonnerToast.promise(promise, {
    loading: messages.loading,
    success: messages.success,
    error: messages.error,
    ...options,
  });
};

/**
 * Generic Toast with Custom Type
 */
export const toast = (message: string, type: ToastType = 'default', options?: ExternalToast) => {
  switch (type) {
    case 'success':
      return toastSuccess(message, options);
    case 'error':
      return toastError(message, options);
    case 'warning':
      return toastWarning(message, options);
    case 'info':
      return toastInfo(message, options);
    default:
      return sonnerToast(message, {
        duration: DEFAULT_DURATION,
        ...options,
      });
  }
};

/**
 * Dismiss a specific toast or all toasts
 */
export const dismissToast = (toastId?: string | number) => {
  if (toastId) {
    sonnerToast.dismiss(toastId);
  } else {
    sonnerToast.dismiss();
  }
};

/**
 * Common toast messages
 */
export const ToastMessages = {
  // Success messages
  jobSaved: 'Job saved successfully!',
  jobRemoved: 'Job removed from saved list.',
  searchCompleted: (count: number) => `Search completed! ${count} jobs found.`,
  searchSaved: 'Search profile saved!',
  searchUpdated: 'Search profile updated!',
  searchDeleted: 'Search profile deleted.',
  sessionAborted: 'Session aborted successfully.',
  urlsProcessed: (total: number, successful: number) =>
    `Processed ${total} URLs. ${successful} successful.`,

  // Error messages
  connectionError: 'Failed to connect to server.',
  invalidSearch: 'Invalid search parameters.',
  unauthorized: 'You must be logged in to perform this action.',
  rateLimited: 'Too many requests. Please try again later.',
  unknownError: 'An unexpected error occurred.',

  // Warning messages
  sessionExpiring: 'Session about to expire in 5 minutes.',
  keywordLimit: 'Max keywords limit reached (20).',
  unsavedChanges: 'You have unsaved changes.',
  sessionActive: 'A discovery session is already running.',

  // Info messages
  newJobsAvailable: 'New jobs available.',
  searchRunning: 'Search is running in background.',
  processing: 'Processing your request...',
  copiedToClipboard: 'Copied to clipboard!',
} as const;

// Export all functions
export default {
  success: toastSuccess,
  error: toastError,
  warning: toastWarning,
  info: toastInfo,
  loading: toastLoading,
  promise: toastPromise,
  dismiss: dismissToast,
  messages: ToastMessages,
};
