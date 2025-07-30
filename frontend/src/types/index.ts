// Re-export all types from a central location
export * from './auth';
export * from './user';
export * from './components';
export * from './Navbar';

// Common utility types
export type ApiResponse<T = any> = {
    success: boolean;
    message: string;
    data?: T;
};

export type LoadingState = {
    isLoading: boolean;
    error?: string | null;
};