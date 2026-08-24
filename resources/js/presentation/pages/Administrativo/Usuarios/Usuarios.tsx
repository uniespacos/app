import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDebouncedSearch } from '@/hooks/use-debounced-search';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { ColumnDef, DataTable } from '@/presentation/molecules/DataTable';
import DeleteItem from '@/presentation/molecules/delete-item';
import { EditUserModal } from '@/presentation/molecules/EditUserModal';
import GenericHeader from '@/presentation/molecules/generic-header';
import { SearchFilter } from '@/presentation/molecules/SearchFilter';
import { ViewMode, ViewModeToggle } from '@/presentation/molecules/ViewModeToggle';
import { PermissionModal } from '@/presentation/organisms/PermissionModal';
import AppLayout from '@/presentation/templates/app-layout';
import { Setor, User } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Edit, Settings, Shield, Trash, UserPlus } from 'lucide-react';
import { useMemo, useState } from 'react';

const breadcrumbs = [
    {
        title: 'Gerenciar Usuários',
        href: '/institucional/usuarios',
    },
];

const ROLE_COMUM = 'usuario';

const getRoleBadgeClass = (role: string) => {
    switch (role.toLowerCase()) {
        case 'super-admin':
        case 'administrador':
            return 'bg-destructive/15 text-destructive';
        case 'gestor':
            return 'bg-info/15 text-info-accent';
        default:
            return 'bg-muted text-muted-foreground';
    }
};

const getRoleLabel = (role: string) => {
    switch (role.toLowerCase()) {
        case 'super-admin':
            return 'Super Admin';
        case 'administrador':
            return 'Administrador';
        case 'gestor':
            return 'Gestor';
        default:
            return 'Usuário';
    }
};

export default function Usuarios() {
    const { users, setores, filters } = usePage<{
        users: {
            data: User[];
            links: { url: string | null; label: string; active: boolean }[];
            total: number;
        };
        setores: Setor[];
        filters?: { search: string | null; setor_id: string | null };
    }>().props;

    const isMobile = useIsMobile();
    const [viewMode, setViewMode] = useState<ViewMode>(isMobile ? 'grid' : 'table');
    const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [editingUser, setEditingUser] = useState<User | undefined>(undefined);
    const [removerUsuario, setRemoverUsuario] = useState<User | undefined>(undefined);
    const [selectedSetorId, setSelectedSetorId] = useState<string>(filters?.setor_id ?? 'all');

    const { searchTerm, setSearchTerm } = useDebouncedSearch({
        routeName: 'institucional.usuarios.index',
        initialSearch: filters?.search ?? '',
        extraParams: {
            setor_id: selectedSetorId !== 'all' ? selectedSetorId : '',
        },
    });

    const handleSetorChange = (setorId: string) => {
        setSelectedSetorId(setorId);
        router.get(
            route('institucional.usuarios.index'),
            {
                search: searchTerm || undefined,
                setor_id: setorId !== 'all' ? setorId : undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleUserClick = (user: User) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleEditUser = (user: User) => {
        setEditingUser(user);
    };

    const handlePermissionUpdate = (userId: number, roleName: string, agendas?: number[], directPermissions?: string[]) => {
        setProcessing(true);
        const payload: { role_name: string; agendas: number[]; direct_permissions?: string[] } = {
            role_name: roleName,
            agendas: agendas ?? [],
        };
        if (directPermissions !== undefined) {
            payload.direct_permissions = directPermissions;
        }
        router.put(route('institucional.usuarios.updatepermissions', { user: userId }), payload, {
            onSuccess: () => {
                setIsModalOpen(false);
                setSelectedUser(undefined);
            },
            onFinish: () => {
                setProcessing(false);
            },
        });
    };

    const renderUserActions = (user: User) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="shrink-0">
                    <Settings className="mr-1.5 h-4 w-4" />
                    Gerenciar
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem
                    onClick={() => {
                        handleEditUser(user);
                    }}
                >
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => {
                        handleUserClick(user);
                    }}
                >
                    <Shield className="mr-2 h-4 w-4" />
                    Permissões
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => {
                        setRemoverUsuario(user);
                    }}
                    className="text-destructive"
                >
                    <Trash className="mr-2 h-4 w-4" />
                    Excluir
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    const columns = useMemo<ColumnDef<User>[]>(
        () => [
            {
                header: 'Usuário',
                cell: (user) => (
                    <div className="flex min-w-[200px] items-center space-x-3">
                        <Avatar className="h-9 w-9 shrink-0">
                            <AvatarFallback>
                                {user.name
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')
                                    .toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                            <div className="truncate font-medium">{user.name}</div>
                            <div className="text-muted-foreground truncate text-sm">{user.email}</div>
                            {user.telefone ? <div className="text-muted-foreground text-xs">{user.telefone}</div> : null}
                        </div>
                    </div>
                ),
            },
            {
                header: 'Setor',
                cell: (user) => user.setor?.sigla ?? 'N/A',
            },
            {
                header: 'Papel',
                cell: (user) => <Badge className={getRoleBadgeClass(user.roles[0] ?? ROLE_COMUM)}>{getRoleLabel(user.roles[0] ?? ROLE_COMUM)}</Badge>,
            },
            {
                header: 'Status',
                cell: (user) => (
                    <div className="flex items-center space-x-2">
                        <div className={cn('h-2 w-2 shrink-0 rounded-full', user.email_verified_at ? 'bg-success' : 'bg-destructive')} />
                        <span className="text-muted-foreground text-xs whitespace-nowrap">
                            {user.email_verified_at ? 'Verificado' : 'Não verificado'}
                        </span>
                    </div>
                ),
            },
        ],
        [],
    );

    const renderUserCard = (user: User) => (
        <Card key={user.id} className="transition-shadow hover:shadow-md">
            <CardContent className="space-y-4 p-4">
                <div className="flex items-center space-x-3">
                    <Avatar className="h-11 w-11 shrink-0">
                        <AvatarFallback>
                            {user.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                        <h3 className="truncate text-base font-semibold">{user.name}</h3>
                        <p className="text-muted-foreground truncate text-sm">{user.email}</p>
                        {user.telefone ? <p className="text-muted-foreground text-xs">{user.telefone}</p> : null}
                    </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
                    <div className="flex items-center gap-2">
                        <Badge className={getRoleBadgeClass(user.roles[0] ?? ROLE_COMUM)}>{getRoleLabel(user.roles[0] ?? ROLE_COMUM)}</Badge>
                        <div className="flex items-center space-x-1.5">
                            <div className={cn('h-2 w-2 rounded-full', user.email_verified_at ? 'bg-success' : 'bg-destructive')} />
                            <span className="text-muted-foreground text-xs">{user.email_verified_at ? 'Verificado' : 'Não verificado'}</span>
                        </div>
                    </div>
                    <div>{renderUserActions(user)}</div>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gerenciar Usuários" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-2 sm:p-4">
                <div className="container mx-auto space-y-6 py-4 sm:py-6">
                    <div className="space-y-6 p-2 sm:p-6">
                        <GenericHeader
                            titulo="Gerenciar Usuários"
                            descricao="Visualize e gerencie os usuários cadastrados no sistema"
                            buttonText="Novo Usuário"
                            ButtonIcon={UserPlus}
                            canSeeButton={false}
                        />

                        <Card>
                            <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-end">
                                <div className="w-full flex-1">
                                    <SearchFilter
                                        searchTerm={searchTerm}
                                        onSearchTermChange={setSearchTerm}
                                        placeholder="Buscar por nome, email ou telefone..."
                                        variant="plain"
                                    />
                                </div>
                                <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-end">
                                    <div className="flex-1 space-y-2 sm:w-[180px]">
                                        <Label>Setor</Label>
                                        <Select value={selectedSetorId} onValueChange={handleSetorChange}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Setor" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Todos os setores</SelectItem>
                                                {setores.map((setor) => (
                                                    <SelectItem key={setor.id} value={setor.id.toString()}>
                                                        {setor.sigla}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="shrink-0 self-end sm:self-auto">
                                        <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <DataTable
                            data={users.data}
                            columns={columns}
                            viewMode={viewMode}
                            renderCard={renderUserCard}
                            gridClassName="grid gap-4 grid-cols-1"
                            pagination={{ links: users.links }}
                            emptyState={{
                                title: 'Nenhum usuário encontrado',
                                description: 'Tente ajustar sua busca ou filtros selecionados.',
                            }}
                            actions={renderUserActions}
                        />

                        {removerUsuario && (
                            <DeleteItem
                                itemName={removerUsuario.name}
                                isOpen={(open) => {
                                    if (!open) {
                                        setRemoverUsuario(undefined);
                                    }
                                }}
                                route={route('institucional.usuarios.destroy', { usuario: removerUsuario.id })}
                            />
                        )}

                        <EditUserModal
                            user={editingUser}
                            isOpen={!!editingUser}
                            onClose={() => {
                                setEditingUser(undefined);
                            }}
                        />

                        {isModalOpen && selectedUser && (
                            <PermissionModal
                                key={selectedUser.id}
                                user={selectedUser}
                                isOpen={isModalOpen}
                                onClose={() => {
                                    setIsModalOpen(false);
                                    setSelectedUser(undefined);
                                }}
                                onUpdate={handlePermissionUpdate}
                                processing={processing}
                            />
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
