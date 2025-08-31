export interface AppError extends Error {
  code?: string;
  status?: number;
  details?: any;
}

export class DashboardError extends Error implements AppError {
  public code: string;
  public status: number;
  public details: any;

  constructor(message: string, code: string = 'UNKNOWN_ERROR', status: number = 500, details?: any) {
    super(message);
    this.name = 'DashboardError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export const createError = (message: string, code?: string, status?: number, details?: any): DashboardError => {
  return new DashboardError(message, code, status, details);
};

export const handleAsyncError = async <T>(
  asyncFn: () => Promise<T>,
  errorHandler?: (error: Error) => void
): Promise<T | null> => {
  try {
    return await asyncFn();
  } catch (error) {
    const appError = error instanceof Error ? error : new Error(String(error));
    
    if (errorHandler) {
      errorHandler(appError);
    } else {
      console.error('Unhandled async error:', appError);
    }
    
    return null;
  }
};

export const logError = (error: Error, context?: string) => {
  const timestamp = new Date().toISOString();
  const errorInfo = {
    timestamp,
    message: error.message,
    stack: error.stack,
    context,
    userAgent: navigator.userAgent,
    url: window.location.href,
  };

  console.error('Error logged:', errorInfo);

  // En producción, podrías enviar esto a un servicio de logging
  if (process.env.NODE_ENV === 'production') {
    // Aquí iría el código para enviar a un servicio de logging
    // como Sentry, LogRocket, etc.
  }
};

export const isNetworkError = (error: Error): boolean => {
  return error.message.includes('Network Error') || 
         error.message.includes('Failed to fetch') ||
         error.message.includes('ERR_NETWORK');
};

export const isAuthError = (error: Error): boolean => {
  return error.message.includes('401') || 
         error.message.includes('Unauthorized') ||
         error.message.includes('Forbidden');
};

export const getErrorMessage = (error: Error): string => {
  if (isNetworkError(error)) {
    return 'Error de conexión. Verifica tu conexión a internet e intenta de nuevo.';
  }
  
  if (isAuthError(error)) {
    return 'No tienes permisos para acceder a este recurso.';
  }
  
  return error.message || 'Ha ocurrido un error inesperado.';
}; 