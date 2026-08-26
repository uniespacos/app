import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import {
    PERMISSION_SECAO_GESTAO_CHAMADOS,
    PERMISSION_SECAO_GESTAO_ESPACOS,
    PERMISSION_SECAO_GESTAO_INSTITUICOES,
    PERMISSION_SECAO_GESTAO_MODULOS,
    PERMISSION_SECAO_GESTAO_RESERVAS,
    PERMISSION_SECAO_GESTAO_ROLES,
    PERMISSION_SECAO_GESTAO_SETORES,
    PERMISSION_SECAO_GESTAO_TAXONOMIAS_CHAMADO,
    PERMISSION_SECAO_GESTAO_UNIDADES,
    PERMISSION_SECAO_GESTAO_USUARIOS,
    PERMISSION_SECAO_RELATORIOS,
} from '@/constants/permissions';
import { hasPermission, hasRole } from '@/lib/auth';
import AppLogo from '@/presentation/atoms/app-logo';
import { NavMain } from '@/presentation/molecules/nav-main';
import { NavUser } from '@/presentation/molecules/nav-user';
import type { User } from '@/types';
import { Link, usePage } from '@inertiajs/react';

/* Ícones ---------------------------------------------------------------- */
import {
    BookOpen,
    Briefcase,
    Building,
    Calendar,
    Eye,
    FileBarChart2,
    Grid3X3,
    LayoutGrid,
    MapPin,
    School,
    ShieldCheck,
    Tags,
    TriangleAlert,
    Users,
    Wrench,
} from 'lucide-react';

/* ------------- Tipo local de item de menu (não exportado) ------------- */
import type { LucideIcon } from 'lucide-react';

type MenuItem = {
    title: string;
    href: string;
    icon: LucideIcon;
    items?: MenuItem[];
};

/* ----------------- Itens de navegação (agrupados) ---------------------- */
const commonNav: MenuItem[] = [
    { title: 'Painel Inicial', href: '/dashboard', icon: LayoutGrid },
    { title: 'Consultar Espaços', href: '/espacos', icon: Calendar },
    { title: 'Minhas Reservas', href: '/reservas', icon: BookOpen },
];

/* --------------------------- Componente -------------------------------- */
export function AppSidebar() {
    const { props } = usePage<{ auth: { user: User } }>();
    const user = props.auth.user;

    /* Chamados forma um grupo unico na sidebar. O gestor so alcanca a propria
       fila, e nesse caso o NavMain acha o submenu de um item so. */
    const chamadosItems: MenuItem[] = user
        ? [
              ...(hasPermission(user, PERMISSION_SECAO_GESTAO_CHAMADOS)
                  ? [{ title: 'Fila de Chamados', href: '/gestor/chamados', icon: Wrench }]
                  : []),
              ...(hasPermission(user, PERMISSION_SECAO_GESTAO_ESPACOS)
                  ? [{ title: 'Espaços sem Responsável', href: '/institucional/chamados', icon: TriangleAlert }]
                  : []),
              ...(hasPermission(user, PERMISSION_SECAO_GESTAO_TAXONOMIAS_CHAMADO)
                  ? [{ title: 'Tipos e Categorias', href: '/institucional/taxonomias-chamado', icon: Tags }]
                  : []),
          ]
        : [];

    const extraItems: MenuItem[] = user
        ? [
              ...(hasPermission(user, PERMISSION_SECAO_GESTAO_RESERVAS) ? [{ title: 'Gerir Reservas', href: '/gestor/reservas', icon: Eye }] : []),
              ...(chamadosItems.length > 0 ? [{ title: 'Chamados', href: chamadosItems[0].href, icon: Wrench, items: chamadosItems }] : []),
              ...(hasPermission(user, PERMISSION_SECAO_GESTAO_ESPACOS)
                  ? [{ title: 'Gerir Espaços', href: '/institucional/espacos', icon: Building }]
                  : []),
              ...(hasPermission(user, PERMISSION_SECAO_GESTAO_USUARIOS)
                  ? [{ title: 'Gerenciar Usuários', href: '/institucional/usuarios', icon: Users }]
                  : []),
              ...(hasPermission(user, PERMISSION_SECAO_GESTAO_ROLES)
                  ? [{ title: 'Gerenciar Papéis', href: '/institucional/roles', icon: ShieldCheck }]
                  : []),
              ...(hasPermission(user, PERMISSION_SECAO_GESTAO_INSTITUICOES)
                  ? [{ title: 'Gerenciar Instituições', href: '/institucional/instituicoes', icon: School }]
                  : []),
              ...(hasPermission(user, PERMISSION_SECAO_GESTAO_UNIDADES)
                  ? [{ title: 'Gerenciar Unidades', href: '/institucional/unidades', icon: MapPin }]
                  : []),
              ...(hasPermission(user, PERMISSION_SECAO_GESTAO_MODULOS)
                  ? [{ title: 'Gerenciar Modulos', href: '/institucional/modulos', icon: Grid3X3 }]
                  : []),
              ...(hasPermission(user, PERMISSION_SECAO_GESTAO_SETORES)
                  ? [{ title: 'Gerenciar Setores', href: '/institucional/setors', icon: Briefcase }]
                  : []),
              ...(hasPermission(user, PERMISSION_SECAO_RELATORIOS)
                  ? [
                        {
                            title: 'Relatórios',
                            href: hasRole(user, 'institucional') ? '/institucional/relatorios' : '/gestor/relatorios',
                            icon: FileBarChart2,
                        },
                    ]
                  : []),
          ]
        : [];

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
                {<NavMain label="Painel" items={commonNav} />}

                {/* Seção do cargo */}
                {extraItems.length > 0 && <NavMain label="Gerir" items={extraItems} />}
            </SidebarContent>

            {/* Rodapé ---------------------------------------------------------- */}
            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
