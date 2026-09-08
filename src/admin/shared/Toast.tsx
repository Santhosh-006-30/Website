import toast, { Toaster } from 'react-hot-toast';

export const showToast = {
  success: (msg: string) => toast.success(msg),
  error: (msg: string) => toast.error(msg),
  loading: (msg: string) => toast.loading(msg),
  dismiss: (id?: string) => toast.dismiss(id),
};

export function AdminToaster() {
  return (
    <Toaster
      position="top-right"
      gutter={8}
      toastOptions={{
        duration: 4000,
        style: {
          background: 'rgba(11, 23, 40, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#e2e8f0',
          borderRadius: '12px',
          fontSize: '14px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          padding: '12px 16px',
        },
        success: {
          iconTheme: { primary: '#D7B65A', secondary: '#07111F' },
        },
        error: {
          iconTheme: { primary: '#f87171', secondary: '#07111F' },
        },
      }}
    />
  );
}
