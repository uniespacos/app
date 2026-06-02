import DeleteItem from '@/components/delete-item';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Setor, User } from '@/types';
import { Edit, Trash2, Users } from 'lucide-react';
import { useState } from 'react';

interface Props {
    setores: Setor[];
    usuarios: User[];
    onEdit: (setor: Setor) => void;
    onViewUsuarios: (setor: Setor) => void;
}

export function TabelaSetores({ setores, usuarios, onEdit, onViewUsuarios }: Props) {
    const [removerSetor, setRemoverSetor] = useState<Setor | undefined>();
    const getUsuariosDoSetor = (setorId: number) => {
        return usuarios.filter((user) => user.setor?.id === setorId).length;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Setores Cadastrados</CardTitle>
                <CardDescription>{setores.length} setor(es) encontrado(s)</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Setor</TableHead>
                                <TableHead>Unidade</TableHead>
                                <TableHead>Instituição</TableHead>
                                <TableHead className="text-center">Usuários</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {setores.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-muted-foreground py-8 text-center">
                                        Nenhum setor encontrado
                                    </TableCell>
                                </TableRow>
                            ) : (
                                setores.map((setor) => (
                                    <>
                                        <TableRow key={setor.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{setor.nome}</div>
                                                    <div className="text-muted-foreground text-sm">Sigla: {setor.sigla}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{setor.unidade?.nome}</div>
                                                    <div className="text-muted-foreground text-sm">{setor.unidade?.sigla}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{setor.unidade?.instituicao?.nome}</div>
                                                    <div className="text-muted-foreground text-sm">{setor.unidade?.instituicao?.sigla}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onViewUsuarios(setor)}
                                                    className="flex items-center gap-1"
                                                >
                                                    <Users className="h-4 w-4" />
                                                    <Badge variant="secondary">{getUsuariosDoSetor(setor.id)}</Badge>
                                                </Button>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="sm" onClick={() => onEdit(setor)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => setRemoverSetor(setor)}
                                                        className="flex items-center gap-1"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                        {removerSetor && removerSetor.id === setor.id && (
                                            <TableRow key={setor.id}>
                                                <TableCell style={{ alignItems: 'flex-end' }}>
                                                    <DeleteItem
                                                        showHeading={false}
                                                        itemName={removerSetor.sigla}
                                                        route={route('institucional.setors.destroy', { setor: removerSetor.id })}
                                                        isOpen={(open) => {
                                                            if (!open) {
                                                                setRemoverSetor(undefined);
                                                            }
                                                        }}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
