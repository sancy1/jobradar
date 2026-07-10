'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner } from 'sonner';
import { CheckCircle2, XCircle, AlertTriangle, Info, Loader2, X } from 'lucide-react';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      position="bottom-right"
      richColors
      expand={false}
      closeButton
      duration={5000}
      icons={{
        success: <CheckCircle2 className="h-4 w-4 text-green-500" />,
        error: <XCircle className="h-4 w-4 text-red-500" />,
        warning: <AlertTriangle className="h-4 w-4 text-amber-500" />,
        info: <Info className="h-4 w-4 text-blue-500" />,
        loading: <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />,
        close: <X className="h-3 w-3" />,
      }}
      toastOptions={{
        classNames: {
          toast: 'group toast',
          title: 'toast-title',
          description: 'toast-description',
          actionButton: 'toast-action',
          cancelButton: 'toast-cancel',
          closeButton: 'toast-close',
          success: 'toast-success',
          error: 'toast-error',
          warning: 'toast-warning',
          info: 'toast-info',
          loading: 'toast-loading',
        },
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
