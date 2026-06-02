import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Setor, User } from '@/types';
import { Mail, Phone } from 'lucide-react';

interface Props {
    setor: Setor;
    usuarios: User[];
}

export function UsuariosSetor({ setor, usuarios }: Props) {
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((word) => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="space-y-4">
            {/* Informações do Setor */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UsuarioIcon className="h-5 w-5" />
                        {setor.nome}
                    </CardTitle>
                    <CardDescription>
                        Sigla: {setor.sigla} • {usuarios.length} usuário(s) vinculado(s)
                    </CardDescription>
                </CardHeader>
            </Card>

            {/* Lista de Usuários */}
            <Card>
                <CardHeader>
                    <CardTitle>Usuários Vinculados</CardTitle>
                </CardHeader>
                <CardContent>
                    {usuarios.length === 0 ? (
                        <div className="text-muted-foreground py-8 text-center">
                            <UsuarioIcon className="mx-auto mb-4 h-12 w-12 opacity-50" />
                            <p>Nenhum usuário vinculado a este setor</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Usuário</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Telefone</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {usuarios.map((usuario) => (
                                        <TableRow key={usuario.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={usuario.profile_pic || '/placeholder.svg'} alt={usuario.name} />
                                                        <AvatarFallback className="text-xs">{getInitials(usuario.name)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium">{usuario.name}</div>
                                                        <div className="text-muted-foreground text-sm">ID: {usuario.id}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Mail className="text-muted-foreground h-4 w-4" />
                                                    <span className="text-sm">{usuario.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Phone className="text-muted-foreground h-4 w-4" />
                                                    <span className="text-sm">{usuario.telefone || 'Não informado'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={usuario.email_verified_at ? 'default' : 'secondary'}>
                                                    {usuario.email_verified_at ? 'Verificado' : 'Pendente'}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

const UsuarioIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
    </svg>
);
