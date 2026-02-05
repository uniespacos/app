'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { PermissionModal } from './fragments/PermissionModal';

import { Head, router, usePage } from '@inertiajs/react';
import { Edit, Settings, Shield, Trash } from 'lucide-react';
import { useEffect, useState } from 'react';

import DeleteItem from '@/components/delete-item';
import GenericHeader from '@/components/generic-header';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Instituicao, PermissionType, Setor, User } from '@/types';
import { toast } from 'sonner';
const breadcrumbs = [
    {
        title: 'Gerenciar Usuarios',
        href: '/institucional/usuarios',
    },
];

export default function UsuariosPage() {
    const { props } = usePage<{
        users: User[];
        permissionTypes: PermissionType[];
        instituicoes: Instituicao[];
        setores: Setor[];
    }>();
    const { users: initialUsers, permissionTypes, instituicoes, setores } = props;

    const [users, setUsers] = useState<User[]>(initialUsers);
    const [filteredUsers, setFilteredUsers] = useState<User[]>(initialUsers);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSetor, setSelectedSetor] = useState<Setor | undefined>(undefined);
    const [selectedUser, setSelectedUser] = useState<User | undefined>();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [removerUsuario, setRemoverUsuario] = useState<User | undefined>();
    useEffect(() => {
        if (!searchTerm) {
            setFilteredUsers(users);
            return;
        }
        const filtered = users.filter(
            (user) => user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase()),
        );
        setFilteredUsers(filtered);
    }, [searchTerm, users]);

    useEffect(() => {
        if (!selectedSetor) {
            setFilteredUsers(users);
            return;
        }
        const filtered = users.filter((user) => user.setor?.id === selectedSetor?.id);
        setFilteredUsers(filtered);
    }, [users, selectedSetor]);
    const getPermissionLabel = (permissionTypeId: number) => {
        const permission = permissionTypes.find((p) => p.id === permissionTypeId);
        return permission?.label || 'Desconhecido';
    };

    const getPermissionColor = (permissionTypeId: number) => {
        switch (permissionTypeId) {
            case 1:
                return 'bg-red-100 text-red-800';
            case 2:
                return 'bg-blue-100 text-blue-800';
            case 3:
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const handleUserClick = (user: User) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleEditUser = (user: User) => {
        // TODO: Implementar funcionalidade de edição de usuário
        // Esta função deve abrir um modal ou formulário para editar os dados do usuário
        toast('Funcionalidade de edição ainda não implementada.');
    };

    const handlePermissionUpdate = (userId: number, newPermissionTypeId: number, agendas?: number[]) => {
        setProcessing(true);
        router.put(
            route('institucional.usuarios.updatepermissions', { user: userId }),
            {
                permission_type_id: newPermissionTypeId,
                agendas: agendas || [],
            },
            {
                onSuccess: () => {
                    setUsers(users.map((user) => (user.id === userId ? { ...user, permission_type_id: newPermissionTypeId } : user)));
                    setIsModalOpen(false);
                    setSelectedUser(undefined);
                },
                onFinish: () => {
                    setProcessing(false);
                },
            },
        );
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
                                    <Select
                                        value={selectedSetor?.id.toString() || 'all'} // 5. O valor vem das props
                                        onValueChange={(value) => {
                                            setSelectedSetor(setores.find((s) => s.id.toString() === value));
                                        }}
                                    >
                                        <SelectTrigger className="w-full sm:w-[180px]">
                                            <SelectValue placeholder="Setores" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todas</SelectItem>
                                            {setores.map((setor) => (
                                                <SelectItem key={setor.id} value={setor.id.toString()}>{setor.sigla}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid gap-4">
                            {filteredUsers.map((user) => (
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
                                                        <p className="text-gray-600">{user.email}</p>
                                                        <p className="text-sm text-gray-500">{user.telefone}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    <Badge className={getPermissionColor(user.permission_type_id)}>
                                                        {getPermissionLabel(user.permission_type_id)}
                                                    </Badge>
                                                    <div className="flex items-center space-x-2">
                                                        <div
                                                            className={`h-2 w-2 rounded-full ${user.email_verified_at ? 'bg-green-500' : 'bg-red-500'}`}
                                                        />
                                                        <span className="text-xs text-gray-500">
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
                                                            <DropdownMenuItem onClick={() => setRemoverUsuario(user)} className="text-red-600">
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
                                permissionTypes={permissionTypes}
                                instituicoes={instituicoes}
                                processing={processing}
                            />
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
