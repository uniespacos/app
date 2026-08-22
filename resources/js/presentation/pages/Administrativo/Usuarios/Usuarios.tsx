'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ROLE_COMUM } from '@/constants/permissions';
import { getRoleBadgeClass, getRoleLabel } from '@/constants/role-labels';
import DeleteItem from '@/presentation/molecules/delete-item';
import { EditUserModal } from '@/presentation/molecules/EditUserModal';
import GenericHeader from '@/presentation/molecules/generic-header';
import PaginacaoListas from '@/presentation/molecules/paginacao-listas';
import { PermissionModal } from '@/presentation/organisms/PermissionModal';
import AppLayout from '@/presentation/templates/app-layout';
import { Setor, User } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Edit, Settings, Shield, Trash } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type PaginatedUsers = {
    data: User[];
    links: { url: string | null; label: string; active: boolean }[];
};

const breadcrumbs = [
    {
        title: 'Gerenciar Usuarios',
        href: '/institucional/usuarios',
    },
];

export default function UsuariosPage() {
    const { props } = usePage<{
        users: PaginatedUsers;
        setores: Setor[];
        filters: { search?: string; setor_id?: number };
    }>();
    const { users, setores, filters } = props;

    const [searchTerm, setSearchTerm] = useState(filters.search ?? '');
    const [selectedSetorId, setSelectedSetorId] = useState(filters.setor_id?.toString() ?? 'all');
    const [selectedUser, setSelectedUser] = useState<User | undefined>();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [editingUser, setEditingUser] = useState<User | undefined>();
    const [removerUsuario, setRemoverUsuario] = useState<User | undefined>();
    const isInitialMount = useRef(true);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        const timeout = setTimeout(() => {
            router.get(
                route('institucional.usuarios.index'),
                { search: searchTerm || undefined, setor_id: selectedSetorId !== 'all' ? selectedSetorId : undefined },
                { preserveState: true, preserveScroll: true, replace: true },
            );
        }, 400);

        return () => clearTimeout(timeout);
    }, [searchTerm, selectedSetorId]);

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
            agendas: agendas || [],
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Usuarios" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="container mx-auto space-y-6 p-6">
                    <div className="container mx-auto space-y-6 p-6">
                        <GenericHeader
                            titulo={'Gestão de usuarios'}
                            descricao={'Aqui voce pode gerir os usuarios, editando ou alterando as permissoes'}
                        />
                        <Card>
                            <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Buscar</Label>
                                    <Input
                                        placeholder="Buscar por nome ou email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Setores</Label>
                                    <Select value={selectedSetorId} onValueChange={setSelectedSetorId}>
                                        <SelectTrigger className="w-full sm:w-[180px]">
                                            <SelectValue placeholder="Setores" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todas</SelectItem>
                                            {setores.map((setor) => (
                                                <SelectItem key={setor.id} value={setor.id.toString()}>
                                                    {setor.sigla}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid gap-4">
                            {users.data.map((user) => (
                                <div key={user.id}>
                                    <Card key={user.id} className="cursor-pointer transition-shadow hover:shadow-md">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <Avatar className="h-12 w-12">
                                                        <AvatarFallback>
                                                            {user.name
                                                                .split(' ')
                                                                .map((n) => n[0])
                                                                .join('')
                                                                .toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="space-y-1">
                                                        <h3 className="text-lg font-semibold">{user.name}</h3>
                                                        <p className="text-muted-foreground">{user.email}</p>
                                                        <p className="text-muted-foreground text-sm">{user.telefone}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    <Badge className={getRoleBadgeClass(user.roles?.[0] ?? ROLE_COMUM)}>
                                                        {getRoleLabel(user.roles?.[0] ?? ROLE_COMUM)}
                                                    </Badge>
                                                    <div className="flex items-center space-x-2">
                                                        <div
                                                            className={`h-2 w-2 rounded-full ${user.email_verified_at ? 'bg-success' : 'bg-destructive'}`}
                                                        />
                                                        <span className="text-muted-foreground text-xs">
                                                            {user.email_verified_at ? 'Verificado' : 'Não verificado'}
                                                        </span>
                                                    </div>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="outline" size="sm">
                                                                <Settings className="mr-2 h-4 w-4" />
                                                                Gerenciar
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Editar
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleUserClick(user)}>
                                                                <Shield className="mr-2 h-4 w-4" />
                                                                Permissões
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => setRemoverUsuario(user)} className="text-destructive">
                                                                <Trash className="mr-2 h-4 w-4" />
                                                                Excluir
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    {removerUsuario && removerUsuario.id === user.id && (
                                        <div className="container mx-auto space-y-6 py-6">
                                            <DeleteItem
                                                key={user.id}
                                                itemName={removerUsuario.name}
                                                isOpen={(open) => {
                                                    if (!open) {
                                                        setRemoverUsuario(undefined);
                                                    }
                                                }}
                                                route={route('institucional.usuarios.destroy', { usuario: removerUsuario.id })}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <PaginacaoListas links={users.links} />

                        <EditUserModal user={editingUser} isOpen={!!editingUser} onClose={() => setEditingUser(undefined)} />

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
