import { AppContent } from '@/presentation/templates/app-content';
import { AppShell } from '@/presentation/templates/app-shell';
import { AppSidebar } from '@/presentation/organisms/app-sidebar';
import { AppSidebarHeader } from '@/presentation/organisms/app-sidebar-header';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren } from 'react';

export default function AppSidebarLayout({ children, breadcrumbs = [] }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
        </AppShell>
    );
}
