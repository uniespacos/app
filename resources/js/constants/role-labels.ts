import { ROLE_COMUM, ROLE_GESTOR, ROLE_INSTITUCIONAL } from '@/constants/permissions';

export * from '@/contracts/roles.contract';

export function getRoleLabel(roleName: string): string {
    switch (roleName.toLowerCase()) {
        case ROLE_INSTITUCIONAL:
        case 'super-admin':
        case 'administrador':
            return 'Institucional';
        case ROLE_GESTOR:
            return 'Gestor';
        case ROLE_COMUM:
        case 'usuario':
            return 'Comum';
        default:
            return roleName || 'Desconhecido';
    }
}

export function getRoleBadgeClass(roleName: string): string {
    switch (roleName.toLowerCase()) {
        case ROLE_INSTITUCIONAL:
        case 'super-admin':
        case 'administrador':
            return 'bg-destructive-subtle text-destructive border-destructive/25';
        case ROLE_GESTOR:
            return 'bg-info-subtle text-info-accent border-info/25';
        case ROLE_COMUM:
        case 'usuario':
            return 'bg-secondary text-secondary-foreground border-border';
        default:
            return 'bg-muted text-muted-foreground border-border';
    }
}
