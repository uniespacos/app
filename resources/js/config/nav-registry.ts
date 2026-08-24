import {
    PERMISSION_SECAO_GESTAO_ESPACOS,
    PERMISSION_SECAO_GESTAO_INSTITUICOES,
    PERMISSION_SECAO_GESTAO_MODULOS,
    PERMISSION_SECAO_GESTAO_RESERVAS,
    PERMISSION_SECAO_GESTAO_ROLES,
    PERMISSION_SECAO_GESTAO_SETORES,
    PERMISSION_SECAO_GESTAO_UNIDADES,
    PERMISSION_SECAO_GESTAO_USUARIOS,
    PERMISSION_SECAO_RELATORIOS,
    ROLE_INSTITUCIONAL,
} from '@/constants/permissions';
import type { User } from '@/types';
import type { LucideIcon } from 'lucide-react';
import { BookOpen, Briefcase, Building, Calendar, Eye, FileBarChart2, Grid3X3, LayoutGrid, MapPin, School, ShieldCheck, Users } from 'lucide-react';

/**
 * Fonte única de verdade para as seções navegáveis da aplicação.
 *
 * Cada entrada descreve uma tela e a permissão `secao.*` (já espelhada no
 * middleware da rota em routes/web.php) que o usuário precisa ter para
 * enxergá-la. Para dar acesso a um novo ator/fluxo: crie a permissão
 * `secao.xxx` (PermissionSeeder), aplique-a na rota e adicione UMA entrada
 * aqui — a sidebar se atualiza sozinha, sem tocar em app-sidebar.tsx.
 *
 * Itens sem `permission` são visíveis a qualquer usuário autenticado.
 */
export type NavGroup = 'painel' | 'gerir';

export interface NavEntry {
    title: string;
    href: string;
    icon: LucideIcon;
    group: NavGroup;
    /** Permissão única exigida, ou lista (usuário precisa de pelo menos uma). */
    permission?: string | string[];
    /** Escolhe dinamicamente o href com base no usuário (ex.: relatórios por role). */
    resolveHref?: (user: User) => string;
}

export const NAV_REGISTRY: NavEntry[] = [
    { title: 'Painel Inicial', href: '/dashboard', icon: LayoutGrid, group: 'painel' },
    { title: 'Consultar Espaços', href: '/espacos', icon: Calendar, group: 'painel' },
    { title: 'Minhas Reservas', href: '/reservas', icon: BookOpen, group: 'painel' },

    { title: 'Gerir Reservas', href: '/gestor/reservas', icon: Eye, group: 'gerir', permission: PERMISSION_SECAO_GESTAO_RESERVAS },
    { title: 'Gerir Espaços', href: '/institucional/espacos', icon: Building, group: 'gerir', permission: PERMISSION_SECAO_GESTAO_ESPACOS },
    { title: 'Gerenciar Usuários', href: '/institucional/usuarios', icon: Users, group: 'gerir', permission: PERMISSION_SECAO_GESTAO_USUARIOS },
    { title: 'Gerenciar Papéis', href: '/institucional/roles', icon: ShieldCheck, group: 'gerir', permission: PERMISSION_SECAO_GESTAO_ROLES },
    {
        title: 'Gerenciar Instituições',
        href: '/institucional/instituicoes',
        icon: School,
        group: 'gerir',
        permission: PERMISSION_SECAO_GESTAO_INSTITUICOES,
    },
    { title: 'Gerenciar Unidades', href: '/institucional/unidades', icon: MapPin, group: 'gerir', permission: PERMISSION_SECAO_GESTAO_UNIDADES },
    { title: 'Gerenciar Modulos', href: '/institucional/modulos', icon: Grid3X3, group: 'gerir', permission: PERMISSION_SECAO_GESTAO_MODULOS },
    { title: 'Gerenciar Setores', href: '/institucional/setors', icon: Briefcase, group: 'gerir', permission: PERMISSION_SECAO_GESTAO_SETORES },
    {
        title: 'Relatórios',
        href: '/gestor/relatorios',
        icon: FileBarChart2,
        group: 'gerir',
        permission: PERMISSION_SECAO_RELATORIOS,
        resolveHref: (user) => (user.roles.includes(ROLE_INSTITUCIONAL) ? '/institucional/relatorios' : '/gestor/relatorios'),
    },
];
