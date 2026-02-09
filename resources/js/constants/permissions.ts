export enum PermissionId {
    INSTITUCIONAL = 1,
    GESTOR = 2,
    COMUM = 3,
}
export const PermissionLabels: Record<PermissionId, string> = {
    [PermissionId.INSTITUCIONAL]: 'Institucional',
    [PermissionId.GESTOR]: 'Gestor',
    [PermissionId.COMUM]: 'Comum',
};
export const PermissionIcons: Record<PermissionId, string> = {
    [PermissionId.INSTITUCIONAL]: 'shield-check',
    [PermissionId.GESTOR]: 'users',
    [PermissionId.COMUM]: 'user',
};
export const PermissionDescriptions: Record<PermissionId, string> = {
    [PermissionId.INSTITUCIONAL]: 'Acesso completo para gerenciar espaços, professores e permissões.',
    [PermissionId.GESTOR]: 'Acesso para gerenciar reservas, serviços e manutenção dos espaços.',
    [PermissionId.COMUM]: 'Acesso básico para consultar espaços, fazer reservas e gerenciar perfil.',
};
export const PermissionColors: Record<PermissionId, string> = {
    [PermissionId.INSTITUCIONAL]: 'bg-blue-500',
    [PermissionId.GESTOR]: 'bg-green-500',
    [PermissionId.COMUM]: 'bg-gray-500',
};
export const PermissionColorClasses: Record<PermissionId, string> = {
    [PermissionId.INSTITUCIONAL]: 'text-white',
    [PermissionId.GESTOR]: 'text-white',
    [PermissionId.COMUM]: 'text-white',
};
