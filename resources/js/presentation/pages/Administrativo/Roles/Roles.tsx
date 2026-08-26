import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import GenericHeader from '@/presentation/molecules/generic-header';
import AppLayout from '@/presentation/templates/app-layout';
import type { Permission, Role } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Edit, MoreHorizontal, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import { DeleteRoleConfirmation } from '@/presentation/molecules/DeleteRoleConfirmation';
import { RoleFormModal } from '@/presentation/molecules/RoleFormModal';

interface RolesPageProps {
    roles: Role[];
    permissions: Record<string, Permission[]>;
    [key: string]: unknown;
}

const breadcrumbs = [
    {
        title: 'Gerenciar Papéis',
        href: '/institucional/roles',
    },
];

export default function RolesPage() {
    const { props } = usePage<RolesPageProps>();
    const { roles, permissions } = props;

    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<'all' | 'system' | 'custom'>('all');
    const [showFormModal, setShowFormModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);

    const filteredRoles = useMemo(() => {
        return roles.filter((role) => {
            const matchesSearch =
                role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (role.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

            if (typeFilter === 'system') return matchesSearch && role.is_system;
            if (typeFilter === 'custom') return matchesSearch && !role.is_system;
            return matchesSearch;
        });
    }, [roles, searchTerm, typeFilter]);

    const handleEdit = (role: Role) => {
        setSelectedRole(role);
        setShowFormModal(true);
    };

    const handleDelete = (role: Role) => {
        setSelectedRole(role);
        setShowDeleteModal(true);
    };

    const handleCreateNew = () => {
        setSelectedRole(null);
        setShowFormModal(true);
    };

    const closeFormModal = () => {
        setShowFormModal(false);
        setSelectedRole(null);
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setSelectedRole(null);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gerenciar Papéis" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="container mx-auto space-y-6 p-6">
                    <GenericHeader titulo="Gestão de Papéis" descricao="Crie, edite e gerencie os papéis e suas permissões." />

                    <Card>
                        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-end">
                            <div className="flex-1 space-y-2">
                                <Label>Buscar</Label>
                                <Input
                                    placeholder="Buscar por nome ou descrição..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Tipo</Label>
                                <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as 'all' | 'system' | 'custom')}>
                                    <SelectTrigger className="w-full sm:w-[180px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todas</SelectItem>
                                        <SelectItem value="system">Sistema</SelectItem>
                                        <SelectItem value="custom">Customizadas</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button onClick={handleCreateNew} className="gap-2 sm:self-end">
                                <Plus className="h-4 w-4" />
                                Novo Papel
                            </Button>
                        </CardContent>
                    </Card>

                    <div className="grid gap-4">
                        {filteredRoles.length === 0 ? (
                            <Card>
                                <CardContent className="p-6">
                                    <p className="text-muted-foreground text-center">Nenhum papel encontrado.</p>
                                </CardContent>
                            </Card>
                        ) : (
                            filteredRoles.map((role) => (
                                <Card key={role.id} className="transition-shadow hover:shadow-md">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-lg font-semibold">{role.name}</h3>
                                                    {role.is_system && <Badge variant="secondary">Sistema</Badge>}
                                                </div>
                                                {role.description && <p className="text-muted-foreground mt-1 text-sm">{role.description}</p>}
                                                <div className="text-muted-foreground mt-2 flex gap-4 text-xs">
                                                    <span>
                                                        <strong className="text-foreground">{role.permissions_count ?? 0}</strong> permissões
                                                    </span>
                                                    <span>
                                                        <strong className="text-foreground">{role.users_count ?? 0}</strong> usuário(s)
                                                    </span>
                                                </div>
                                            </div>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="outline" size="sm">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleEdit(role)}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Editar
                                                    </DropdownMenuItem>
                                                    {!role.is_system && (
                                                        <DropdownMenuItem onClick={() => handleDelete(role)} className="text-red-600">
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Deletar
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <RoleFormModal isOpen={showFormModal} role={selectedRole} permissions={permissions} onClose={closeFormModal} />

            <DeleteRoleConfirmation isOpen={showDeleteModal} role={selectedRole} onClose={closeDeleteModal} />
        </AppLayout>
    );
}
