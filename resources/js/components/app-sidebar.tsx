import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { PermissionId } from '@/constants/permissions';
import { Link, usePage } from '@inertiajs/react';
import AppLogo from './app-logo';

/* Ícones ---------------------------------------------------------------- */
import {
    BookOpen,
    Building,
    Calendar,
    Eye,
    LayoutGrid,
    Star,
    Users,
    School,
    MapPin,
    Grid3X3,
    Briefcase
} from 'lucide-react';

/* ------------- Tipo local de item de menu (não exportado) ------------- */
import type { LucideIcon } from 'lucide-react';

type MenuItem = {
    title: string;
    href: string;
    icon: LucideIcon;
};

/* ----------------- Itens de navegação (agrupados) ---------------------- */
const commonNav: MenuItem[] = [
    { title: 'Painel Inicial', href: '/dashboard', icon: LayoutGrid },
    { title: 'Consultar Espaços', href: '/espacos', icon: Calendar },
    { title: 'Minhas Reservas', href: '/reservas', icon: BookOpen },
    { title: 'Espaços Favoritos', href: route('espacos.favoritos'), icon: Star },
];

const gestorExtras: MenuItem[] = [{ title: 'Gerir Reservas', href: '/gestor/reservas', icon: Eye }];

const institucionalExtras: MenuItem[] = [
    { title: 'Gerir Espaços', href: '/institucional/espacos', icon: Building },
    { title: 'Gerenciar Usuários', href: '/institucional/usuarios', icon: Users },
    { title: 'Gerenciar Instituicoes', href: '/institucional/instituicoes', icon: School },
    { title: 'Gerenciar Unidades', href: '/institucional/unidades', icon: MapPin },
    { title: 'Gerenciar Modulos', href: '/institucional/modulos', icon: Grid3X3 },
    { title: 'Gerenciar Setores', href: '/institucional/setors', icon: Briefcase },
];

/* Rotulagem da seção extra --------------------------------------------- */
const roleLabels: Record<PermissionId, string> = {
    [PermissionId.COMUM]: 'Menu',
    [PermissionId.GESTOR]: 'Gestor de Serviço',
    [PermissionId.INSTITUCIONAL]: 'Master (Administrador)',
};

/* Mapeia ID → itens extras --------------------------------------------- */
const roleExtrasMap: Record<PermissionId, MenuItem[]> = {
    [PermissionId.COMUM]: [],
    [PermissionId.GESTOR]: gestorExtras,
    [PermissionId.INSTITUCIONAL]: institucionalExtras,
};

/* --------------------------- Componente -------------------------------- */
export function AppSidebar() {
    const { props } = usePage<{ auth: { user: { permission_type_id: number } } }>();
    const permissionId = (props.auth.user?.permission_type_id as PermissionId) ?? PermissionId.COMUM;

    const extraItems = roleExtrasMap[permissionId];

    return (
        <Sidebar collapsible="icon" variant="inset">
            {/* Cabeçalho ------------------------------------------------------- */}
            <SidebarHeader>
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
                {<NavMain label='Painel' items={commonNav} />}

                {/* Seção do cargo */}
                {extraItems.length > 0 && <NavMain label='Gerir' items={extraItems} />}
            </SidebarContent>

            {/* Rodapé ---------------------------------------------------------- */}
            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
