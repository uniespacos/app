import { SidebarTrigger } from '@/components/ui/sidebar';
import AppLogoIcon from '@/presentation/atoms/app-logo-icon';
import { Breadcrumbs } from '@/presentation/molecules/breadcrumbs';
import { NotificationDropdown } from '@/presentation/organisms/notification-dropdown';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { Link } from '@inertiajs/react';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    return (
        <header className="border-sidebar-border/50 flex h-16 shrink-0 items-center gap-2 border-b px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex w-full items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="-ml-1" />
                    {/* No desktop a sidebar fica sempre visível com a marca no
                        próprio cabeçalho dela. No mobile ela some por trás do
                        Sheet — sem isso, a barra superior não tinha nenhuma
                        identidade do UniEspaços enquanto o menu está fechado. */}
                    <Link href="/dashboard" className="flex items-center gap-1.5 md:hidden">
                        <AppLogoIcon className="size-6" />
                        <span className="text-sm font-semibold">UniEspaços</span>
                    </Link>
                    {/* No mobile o título da página já aparece como H1 no corpo
                        do conteúdo — repetir aqui competia com a marca pelo
                        pouco espaço da barra. */}
                    <div className="hidden md:block">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>

                <NotificationDropdown />
            </div>
        </header>
    );
}
