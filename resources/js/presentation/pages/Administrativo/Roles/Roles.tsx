import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ColumnDef, DataTable } from '@/presentation/molecules/DataTable';
import GenericHeader from '@/presentation/molecules/GenericHeader';
import { DeleteRoleConfirmation } from '@/presentation/organisms/DeleteRoleConfirmation';
import { RoleFormModal } from '@/presentation/organisms/RoleFormModal';
import AppLayout from '@/presentation/templates/AppLayout';
import type { Permission, Role } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Edit, MoreHorizontal, Plus, Shield, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

const breadcrumbs = [
    {
        title: 'Gerenciar Papéis',
        href: '/institucional/roles',
    },
];

export default function RolesPage() {
    const { roles, permissions } = usePage<{
        roles: Role[];
        permissions: Record<string, Permission[]>;
    }>().props;

    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<'all' | 'system' | 'custom'>('all');
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [showFormModal, setShowFormModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

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

    const renderRoleActions = (role: Role) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" aria-label={`Ações do papel ${role.name}`}>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem
                    onClick={() => {
                        handleEdit(role);
                    }}
                >
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                </DropdownMenuItem>
                {!role.is_system && (
                    <DropdownMenuItem
                        onClick={() => {
                            handleDelete(role);
                        }}
                        className="text-destructive focus:text-destructive"
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Deletar
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );

    const columns = useMemo<ColumnDef<Role>[]>(
        () => [
            {
                id: 'nome',
                header: 'Papel',
                enableSorting: true,
                cell: (role) => (
                    <div className="flex items-center gap-2.5">
                        <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-md">
                            <Shield className="h-4 w-4" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-foreground font-semibold">{role.name}</span>
                                {role.is_system && (
                                    <Badge variant="secondary" className="text-xs">
                                        Sistema
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                ),
            },
            {
                id: 'descricao',
                header: 'Descrição',
                cell: (role) => <span className="text-muted-foreground text-sm">{role.description ?? 'Sem descrição'}</span>,
            },
            {
                id: 'permissoes',
                header: 'Permissões',
                align: 'center',
                width: '120px',
                cell: (role) => (
                    <Badge variant="outline" className="text-xs">
                        {String(role.permissions_count ?? 0)} permissões
                    </Badge>
                ),
            },
            {
                id: 'usuarios',
                header: 'Usuários',
                align: 'center',
                width: '120px',
                cell: (role) => <span className="text-foreground text-sm font-medium">{String(role.users_count ?? 0)} usuário(s)</span>,
            },
        ],
        [],
    );

    const renderCard = (role: Role) => (
        <Card key={role.id} className="border-border transition-shadow hover:shadow-md">
            <CardContent className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <h3 className="text-foreground truncate text-base font-semibold">{role.name}</h3>
                            {role.is_system && (
                                <Badge variant="secondary" className="text-xs">
                                    Sistema
                                </Badge>
                            )}
                        </div>
                        {role.description && <p className="text-muted-foreground mt-1 text-xs">{role.description}</p>}
                    </div>
                    <div>{renderRoleActions(role)}</div>
                </div>
                <div className="text-muted-foreground flex gap-4 border-t pt-2 text-xs">
                    <span>
                        <strong className="text-foreground">{String(role.permissions_count ?? 0)}</strong> permissões
                    </span>
                    <span>
                        <strong className="text-foreground">{String(role.users_count ?? 0)}</strong> usuário(s)
                    </span>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gerenciar Papéis" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <GenericHeader
                    titulo="Gestão de Papéis"
                    descricao="Crie, edite e gerencie os papéis e suas permissões."
                    buttonText="Novo Papel"
                    ButtonIcon={Plus}
                    canSeeButton={true}
                    buttonOnClick={handleCreateNew}
                />

                <Card>
                    <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-end">
                        <div className="flex-1 space-y-2">
                            <Label>Buscar</Label>
                            <Input
                                placeholder="Buscar por nome ou descrição..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                }}
                            />
                        </div>

                        <div className="space-y-2 sm:w-[180px]">
                            <Label>Tipo</Label>
                            <Select
                                value={typeFilter}
                                onValueChange={(v) => {
                                    setTypeFilter(v as 'all' | 'system' | 'custom');
                                }}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todas</SelectItem>
                                    <SelectItem value="system">Sistema</SelectItem>
                                    <SelectItem value="custom">Customizadas</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                <DataTable
                    data={filteredRoles}
                    columns={columns}
                    autoCardViewOnMobile={true}
                    enableColumnVisibility={true}
                    renderCard={renderCard}
                    gridClassName="grid gap-4 grid-cols-1"
                    emptyState={{
                        title: 'Nenhum papel encontrado',
                        description: 'Ajuste seus filtros para encontrar outros papéis.',
                    }}
                    actions={renderRoleActions}
                />
            </div>

            <RoleFormModal isOpen={showFormModal} role={selectedRole} permissions={permissions} onClose={closeFormModal} />

            <DeleteRoleConfirmation isOpen={showDeleteModal} role={selectedRole} onClose={closeDeleteModal} />
        </AppLayout>
    );
}
