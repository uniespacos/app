'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { ROLE_COMUM, ROLE_GESTOR, ROLE_INSTITUCIONAL, PERMISSION_USUARIOS_GERENCIAR_PERMISSOES_DIRETAS } from '@/constants/permissions';
import { getGroupLabel, getPermissionLabel } from '@/constants/permission-labels';
import { Agenda, Instituicao, Permission, SelectedAgenda, User } from '@/types';
import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import { hasPermission } from '@/lib/auth';
import FiltroBuscaPermission from '@/presentation/organisms/FiltroBuscaPermission';

const ROLE_OPTIONS = [
    { value: ROLE_INSTITUCIONAL, label: 'Institucional' },
    { value: ROLE_GESTOR, label: 'Gestor' },
    { value: ROLE_COMUM, label: 'Comum' },
];

interface PermissionModalProps {
    user: User | undefined;
    isOpen: boolean;
    processing?: boolean;
    onClose: () => void;
    onUpdate: (userId: number, roleName: string, agendas?: number[], directPermissions?: string[]) => void;
    instituicoes: Instituicao[];
    permissionCatalog: Record<string, Permission[]>;
    initialAgendas?: Agenda[];
}

export function PermissionModal({ user, isOpen, onClose, onUpdate, instituicoes, permissionCatalog, processing = false }: PermissionModalProps) {
    const { props } = usePage<{ auth: { user: User } }>();
    const currentUser = props.auth.user;
    const canManageDirectPermissions = hasPermission(currentUser, PERMISSION_USUARIOS_GERENCIAR_PERMISSOES_DIRETAS);

    const [selectedRole, setSelectedRole] = useState<string>(ROLE_COMUM);
    const [selectedAgendas, setSelectedAgendas] = useState<SelectedAgenda[]>(
        user?.agendas!.map(
            (agenda) =>
                ({
                    agenda: agenda,
                    espaco: agenda.espaco,
                    andar: agenda.espaco?.andar,
                    modulo: agenda.espaco?.andar?.modulo,
                    unidade: agenda.espaco?.andar?.modulo?.unidade,
                    instituicao: agenda.espaco?.andar?.modulo?.unidade?.instituicao,
                }) as SelectedAgenda,
        ) || [],
    );

    const [directPermissions, setDirectPermissions] = useState<string[]>(user?.direct_permissions || []);
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (user) {
            setSelectedRole(user.roles?.[0] ?? ROLE_COMUM);
            setDirectPermissions(user?.direct_permissions || []);
        }
    }, [user]);

    const handleTogglePermission = (permissionName: string) => {
        setDirectPermissions((prev) =>
            prev.includes(permissionName)
                ? prev.filter((p) => p !== permissionName)
                : [...prev, permissionName]
        );
    };

    const handleSubmit = () => {
        if (!user) return;

        const agendaIds = selectedAgendas.map((sa) => sa.agenda.id);
        onUpdate(user.id, selectedRole, agendaIds, canManageDirectPermissions ? directPermissions : undefined);
    };

    if (!user) return null;

    const inheritedPermissions = (user.permissions || []).filter((p) => !directPermissions.includes(p));

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Gerenciar Permissões - {user.name}</DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="role" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="role">Papel</TabsTrigger>
                        {canManageDirectPermissions && <TabsTrigger value="permissions">Permissões Diretas</TabsTrigger>}
                    </TabsList>

                    <TabsContent value="role" className="space-y-6 mt-6">
                        <div className="space-y-2">
                            <Label htmlFor="permission-type">Papel do usuário</Label>
                            <Select value={selectedRole} onValueChange={setSelectedRole}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o papel" />
                                </SelectTrigger>
                                <SelectContent>
                                    {ROLE_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {selectedRole === ROLE_GESTOR && (
                            <FiltroBuscaPermission
                                instituicoes={instituicoes}
                                selectedAgendas={selectedAgendas}
                                setSelectedAgendas={setSelectedAgendas}
                            />
                        )}

                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={onClose}>
                                Cancelar
                            </Button>
                            <Button onClick={handleSubmit} disabled={processing}>
                                Salvar Permissões
                            </Button>
                        </div>
                    </TabsContent>

                    {canManageDirectPermissions && (
                        <TabsContent value="permissions" className="space-y-6 mt-6">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <Label className="text-base">Permissões Diretas</Label>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Permissões herdadas via papel aparecem desabilitadas. Marque para conceder permissões extras.
                                    </p>
                                </div>
                                <Badge variant="secondary">{directPermissions.length} diretas</Badge>
                            </div>

                            <div className="space-y-2">
                                {Object.entries(permissionCatalog).map(([group, perms]) => {
                                    const directInGroup = perms.filter((p) => directPermissions.includes(p.name)).length;
                                    const inheritedInGroup = perms.filter((p) => inheritedPermissions.includes(p.name)).length;
                                    const isOpen = openGroups[group] ?? false;

                                    return (
                                        <Collapsible
                                            key={group}
                                            open={isOpen}
                                            onOpenChange={(o) => setOpenGroups((prev) => ({ ...prev, [group]: o }))}
                                            className="rounded-md border"
                                        >
                                            <CollapsibleTrigger className="flex items-center gap-2 w-full p-3 hover:bg-muted/50 text-left">
                                                <span className="font-medium">{getGroupLabel(group)}</span>
                                                <Badge variant={directInGroup > 0 ? 'default' : 'outline'} className="text-xs">
                                                    {directInGroup} direta{directInGroup !== 1 ? 's' : ''}
                                                </Badge>
                                                {inheritedInGroup > 0 && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        {inheritedInGroup} herdada{inheritedInGroup !== 1 ? 's' : ''}
                                                    </Badge>
                                                )}
                                                <ChevronDown
                                                    className={`h-4 w-4 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`}
                                                />
                                            </CollapsibleTrigger>

                                            <CollapsibleContent>
                                                <div className="border-t bg-muted/20 p-3 space-y-2">
                                                    {perms.map((perm) => {
                                                        const isInherited = inheritedPermissions.includes(perm.name);
                                                        const isDirect = directPermissions.includes(perm.name);

                                                        return (
                                                            <Label
                                                                key={perm.name}
                                                                className={`flex items-start gap-3 p-2 rounded ${isInherited ? 'opacity-60' : 'hover:bg-background cursor-pointer'} text-foreground font-normal leading-normal select-none`}
                                                            >
                                                                <Checkbox
                                                                    checked={isInherited || isDirect}
                                                                    disabled={isInherited}
                                                                    onCheckedChange={() => !isInherited && handleTogglePermission(perm.name)}
                                                                    className="mt-0.5"
                                                                />
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="text-sm flex items-center gap-2">
                                                                        {getPermissionLabel(perm.name)}
                                                                        {isInherited && (
                                                                            <Badge variant="secondary" className="text-xs">herdada</Badge>
                                                                        )}
                                                                    </div>
                                                                    <div className="text-xs text-muted-foreground font-mono">{perm.name}</div>
                                                                </div>
                                                            </Label>
                                                        );
                                                    })}
                                                </div>
                                            </CollapsibleContent>
                                        </Collapsible>
                                    );
                                })}
                            </div>

                            <div className="flex justify-end space-x-2 pt-4 border-t">
                                <Button variant="outline" onClick={onClose}>
                                    Cancelar
                                </Button>
                                <Button onClick={handleSubmit} disabled={processing}>
                                    Salvar Permissões
                                </Button>
                            </div>
                        </TabsContent>
                    )}
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
