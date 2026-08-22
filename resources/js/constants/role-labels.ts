import { ROLE_COMUM, ROLE_GESTOR, ROLE_INSTITUCIONAL } from '@/constants/permissions';

export function getRoleLabel(roleName: string): string {
    switch (roleName) {
        case ROLE_INSTITUCIONAL:
            return 'Institucional';
        case ROLE_GESTOR:
            return 'Gestor';
        case ROLE_COMUM:
            return 'Comum';
        default:
            return roleName || 'Desconhecido';
    }
}

export function getRoleBadgeClass(roleName: string): string {
    switch (roleName) {
        case ROLE_INSTITUCIONAL:
            return 'bg-destructive-subtle text-destructive';
        case ROLE_GESTOR:
            return 'bg-info-subtle text-info-accent';
        default:
            return 'bg-muted text-foreground';
    }
}
