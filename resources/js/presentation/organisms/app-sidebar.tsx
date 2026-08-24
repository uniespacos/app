import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { NAV_REGISTRY } from '@/config/nav-registry';
import { canAccessNavEntry } from '@/lib/auth';
import AppLogo from '@/presentation/atoms/app-logo';
import { NavMain } from '@/presentation/molecules/nav-main';
import { NavUser } from '@/presentation/molecules/nav-user';
import type { User } from '@/types';
import { Link, usePage } from '@inertiajs/react';

/* --------------------------- Componente -------------------------------- */
export function AppSidebar() {
    const { props } = usePage<{ auth: { user: User } }>();
    const user = props.auth.user;

    const visibleEntries = user ? NAV_REGISTRY.filter((entry) => canAccessNavEntry(user, entry)) : [];

    const commonNav = visibleEntries
        .filter((entry) => entry.group === 'painel')
        .map((entry) => ({ title: entry.title, href: entry.href, icon: entry.icon }));

    const extraItems = visibleEntries
        .filter((entry) => entry.group === 'gerir')
        .map((entry) => ({ title: entry.title, href: entry.resolveHref ? entry.resolveHref(user) : entry.href, icon: entry.icon }));

    return (
        <Sidebar collapsible="icon" variant="inset">
            {/* Cabeçalho ------------------------------------------------------- */}
            {/* border-b separa a marca do restante do menu — sem ela o Sheet
                mobile ficava com a logo flutuando solta no topo de uma lista
                de itens, sem nenhuma divisão visual entre as duas áreas. */}
            <SidebarHeader className="border-sidebar-border/50 border-b">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* Conteúdo -------------------------------------------------------- */}
            <SidebarContent>
                {/* Itens comuns */}
                {<NavMain label="Painel" items={commonNav} />}

                {/* Seção do cargo */}
                {extraItems.length > 0 && <NavMain label="Gerir" items={extraItems} />}
            </SidebarContent>

            {/* Rodapé ---------------------------------------------------------- */}
            <SidebarFooter className="border-sidebar-border/50 border-t">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
