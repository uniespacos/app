'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, Trash2 } from 'lucide-react';

export interface TaxonomiaChamado {
    id: number;
    nome: string;
    slug: string;
    descricao: string | null;
    ordem: number;
    exibe_alerta_espaco?: boolean;
}

interface Props {
    itens: TaxonomiaChamado[];
    comAlerta: boolean;
    vazioTexto: string;
    onEdit: (item: TaxonomiaChamado) => void;
    onDelete: (item: TaxonomiaChamado) => void;
}

export function TabelaTaxonomiaChamado({ itens, comAlerta, vazioTexto, onEdit, onDelete }: Props) {
    if (itens.length === 0) {
        return <div className="text-muted-foreground rounded-lg border border-dashed p-12 text-center">{vazioTexto}</div>;
    }

    return (
        <div className="rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-16">Ordem</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Descrição</TableHead>
                        {comAlerta && <TableHead>Alerta na reserva</TableHead>}
                        <TableHead className="w-28 text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {itens.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell className="text-muted-foreground">{item.ordem}</TableCell>
                            <TableCell>
                                <span className="font-medium">{item.nome}</span>
                                <span className="text-muted-foreground block font-mono text-xs">{item.slug}</span>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">{item.descricao ?? '—'}</TableCell>
                            {comAlerta && (
                                <TableCell>
                                    {item.exibe_alerta_espaco ? (
                                        <Badge variant="secondary">Conta</Badge>
                                    ) : (
                                        <span className="text-muted-foreground text-sm">Não conta</span>
                                    )}
                                </TableCell>
                            )}
                            <TableCell className="text-right">
                                <Button variant="ghost" size="sm" onClick={() => onEdit(item)} aria-label={`Editar ${item.nome}`}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => onDelete(item)} aria-label={`Remover ${item.nome}`}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
