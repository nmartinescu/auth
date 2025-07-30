import { ReactNode } from 'react';

export interface ProtectedRouteProps {
    children: ReactNode;
}

export interface DashboardProps {
    // Add any dashboard-specific props here if needed in the future
}

// Common component props
export interface BaseComponentProps {
    className?: string;
    children?: ReactNode;
}