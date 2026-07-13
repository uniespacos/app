import { NavMain } from '@/presentation/molecules/nav-main';
import { NavUser } from '@/presentation/molecules/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Link, usePage } from '@inertiajs/react';
import { hasPermission } from '@/lib/auth';
import AppLogo from '@/presentation/atoms/app-logo';
import type { User } from '@/types';
import {
    PERMISSION_SECAO_GESTAO_RESERVAS,
    PERMISSION_SECAO_GESTAO_ESPACOS,
    PERMISSION_SECAO_GESTAO_USUARIOS,
    PERMISSION_SECAO_GESTAO_INSTITUICOES,
    PERMISSION_SECAO_GESTAO_UNIDADES,
    PERMISSION_SECAO_GESTAO_MODULOS,
    PERMISSION_SECAO_GESTAO_SETORES,
    PERMISSION_SECAO_GESTAO_ROLES,
} from '@/constants/permissions';

/* Ícones ---------------------------------------------------------------- */
import { BookOpen, Briefcase, Building, Calendar, Eye, Grid3X3, LayoutGrid, MapPin, School, ShieldCheck, Users } from 'lucide-react';

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
];


/* --------------------------- Componente -------------------------------- */
export function AppSidebar() {
    const { props } = usePage<{ auth: { user: User } }>();
    const user = props.auth.user;

    const extraItems: MenuItem[] = user
        ? [
              ...(hasPermission(user, PERMISSION_SECAO_GESTAO_RESERVAS)     ? [{ title: 'Gerir Reservas',          href: '/gestor/reservas',            icon: Eye        }] : []),
              ...(hasPermission(user, PERMISSION_SECAO_GESTAO_ESPACOS)      ? [{ title: 'Gerir Espaços',            href: '/institucional/espacos',      icon: Building   }] : []),
              ...(hasPermission(user, PERMISSION_SECAO_GESTAO_USUARIOS)     ? [{ title: 'Gerenciar Usuários',       href: '/institucional/usuarios',     icon: Users      }] : []),
              ...(hasPermission(user, PERMISSION_SECAO_GESTAO_ROLES)        ? [{ title: 'Gerenciar Papéis',         href: '/institucional/roles',        icon: ShieldCheck}] : []),
              ...(hasPermission(user, PERMISSION_SECAO_GESTAO_INSTITUICOES) ? [{ title: 'Gerenciar Instituições',   href: '/institucional/instituicoes', icon: School     }] : []),
              ...(hasPermission(user, PERMISSION_SECAO_GESTAO_UNIDADES)     ? [{ title: 'Gerenciar Unidades',       href: '/institucional/unidades',     icon: MapPin     }] : []),
              ...(hasPermission(user, PERMISSION_SECAO_GESTAO_MODULOS)      ? [{ title: 'Gerenciar Modulos',        href: '/institucional/modulos',      icon: Grid3X3    }] : []),
              ...(hasPermission(user, PERMISSION_SECAO_GESTAO_SETORES)      ? [{ title: 'Gerenciar Setores',        href: '/institucional/setors',       icon: Briefcase  }] : []),
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
