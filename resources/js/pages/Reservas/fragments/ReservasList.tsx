import DeleteItem from '@/components/delete-item';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDate, getStatusReservaColor, getStatusReservaText, getTurnoText } from '@/lib/utils';
import { Paginator, Reserva, SituacaoReserva, User as UserType } from '@/types';
import { Link, router } from '@inertiajs/react';
import { CheckCircle, Clock, Edit, Eye, SquareArrowDown, XCircle, XSquare } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import ReservaDetalhes from './ReservasDetalhes';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// Tipos baseados no modelo de dados fornecido
export function SituacaoIndicator({ situacao }: { situacao: SituacaoReserva }) {
    return (
        <span className="flex items-center gap-2">
            <span className={`h-3 w-3 rounded-full ${getStatusReservaColor(situacao)}`}></span>
            <span className="text-sm font-medium">{getStatusReservaText(situacao)}</span>
        </span>
    );
}
// Componente para exibir o status da reserva com cores e ícones apropriados
export function SituacaoBadge({ situacao }: { situacao: SituacaoReserva }) {
    switch (situacao) {
        case 'em_analise':
            return (
                <Badge variant="outline" className="flex items-center gap-1 border-yellow-200 bg-yellow-50 text-yellow-700">
                    <Clock className="h-3 w-3" />
                    Em analise
                </Badge>
            );
        case 'parcialmente_deferida':
            return (
                <Badge variant="outline" className="flex items-center gap-1 border-blue-200 bg-blue-50 text-blue-700">
                    <CheckCircle className="h-3 w-3" />
                    Parcialmente Deferida
                </Badge>
            );
        case 'deferida':
            return (
                <Badge variant="outline" className="flex items-center gap-1 border-green-200 bg-green-50 text-green-700">
                    <CheckCircle className="h-3 w-3" />
                    Deferida
                </Badge>
            );
        case 'indeferida':
            return (
                <Badge variant="outline" className="flex items-center gap-1 border-red-200 bg-red-50 text-red-700">
                    <XSquare className="h-3 w-3" />
                    Indeferida
                </Badge>
            );
        case 'inativa':
            return (
                <Badge variant="outline" className="border-black-200 text-black-700 flex items-center gap-1 bg-gray-50">
                    <XSquare className="h-3 w-3" />
                    Inativa / Cancelada
                </Badge>
            );
        default:
            return null;
    }
}
interface ReservasListProps {
    reservaToShow?: Reserva | undefined;

    paginator: Paginator<Reserva>;
    fallback: React.ReactNode;
    isGestor: boolean;
    user?: UserType;
}
// Componente principal da lista de reservas
export function ReservasList({ paginator, fallback, isGestor, user, reservaToShow }: ReservasListProps) {
    const { data: reservas, links } = paginator;
    const [selectedReserva, setSelectedReserva] = useState<Reserva | undefined>(undefined);
    const [removerReserva, setRemoverReserva] = useState<Reserva | null>(null);
    const [reservasFiltradas, setReservasFiltradas] = useState<Reserva[]>(
        reservas.sort((a, b) => {
            if (a.situacao === 'em_analise' && b.situacao !== 'em_analise') return -1;
            if (b.situacao === 'em_analise' && a.situacao !== 'parcialmente_deferida') return 1;
            return 0;
        }),
    );

    useEffect(() => {
        if (isGestor) {
            const reservasParaExibir = reservas.map((reserva) => {
                const horariosQueGerencio = reserva.horarios.filter((horario) => {
                    return horario.agenda?.user?.id === user?.id;
                });

                if (reserva.situacao === 'parcialmente_deferida' || reserva.situacao === 'em_analise') {
                    const situacoes = horariosQueGerencio.map((horario) => horario.pivot?.situacao);
                    if (situacoes.includes('em_analise')) {
                        return {
                            ...reserva,
                            situacao: 'em_analise' as SituacaoReserva,
                        };
                    }
                    if (situacoes.every((situacao) => situacao === 'deferida')) {
                        return {
                            ...reserva,
                            situacao: 'deferida' as SituacaoReserva,
                        };
                    }
                    if (situacoes.every((situacao) => situacao === 'indeferida')) {
                        return {
                            ...reserva,
                            situacao: 'indeferida' as SituacaoReserva,
                        };
                    }
                }

                return reserva;
            });
            setReservasFiltradas(reservasParaExibir.sort((a, b) => {
                if (a.situacao === 'em_analise' && b.situacao !== 'em_analise') return -1;
                if (b.situacao === 'em_analise' && a.situacao !== 'em_analise') return 1;
                return 0;
            }));
        } else {
            setReservasFiltradas(reservas);
        }
    }, [isGestor, reservas, user?.id]);
    useEffect(() => {
        if (reservaToShow) {
            setSelectedReserva(reservaToShow);
        }
    }, [reservaToShow]);
    if (reservas.length === 0) {
        return fallback;
    }
    const handleAvaliarButton = (id: number) => {
        router.get(route('gestor.reservas.show', id));
    };

    return (
        <div className="space-y-4">
            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Título</TableHead>
                            <TableHead className="hidden md:table-cell">Situação</TableHead>
                            <TableHead className="hidden md:table-cell">Local</TableHead>
                            <TableHead className="hidden lg:table-cell">Data início</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reservasFiltradas.map((reserva) => (
                            <TableRow key={reserva.id}>
                                <TableCell className="font-medium">
                                    <div>
                                        {reserva.titulo.substring(0, 30)}
                                        {reserva.titulo.length > 30 ? '...' : ''}
                                        <p className="text-muted-foreground hidden text-sm sm:block">
                                            {reserva.descricao.substring(0, 30)}
                                            {reserva.descricao.length > 30 ? '...' : ''}
                                        </p>
                                    </div>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                    <SituacaoBadge situacao={reserva.situacao} />
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                    <div>
                                        <p>
                                            Espaço: {reserva.horarios[0]?.agenda?.espaco?.nome ?? ' '} /
                                            {reserva.horarios[0]?.agenda!.turno ? getTurnoText(reserva.horarios[0].agenda?.turno) : null}
                                        </p>
                                    </div>
                                </TableCell>

                                <TableCell className="hidden lg:table-cell">{formatDate(reserva.data_inicial)}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2 pt-2">
                                        <DropdownMenu key={reserva.id}>
                                            <DropdownMenuTrigger asChild >
                                                <Button variant="outline" size="sm" >
                                                    <SquareArrowDown className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => setSelectedReserva(reserva)}>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    Detalhes
                                                </DropdownMenuItem>
                                                {reserva.situacao !== 'inativa' ? (
                                                    isGestor ? (
                                                        <DropdownMenuItem
                                                            onClick={() => handleAvaliarButton(reserva.id)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                            {reserva.situacao === 'em_analise' ? 'Avaliar' : 'Reavaliar'}
                                                        </DropdownMenuItem>
                                                    ) : (
                                                        <>
                                                            {reserva.situacao === 'em_analise' && (
                                                                <DropdownMenuItem
                                                                    onClick={() => {
                                                                        router.get(`reservas/${reserva.id}/edit`);
                                                                    }}
                                                                >
                                                                    <Edit />
                                                                    Editar
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuItem
                                                                onClick={() => setRemoverReserva(reserva)}
                                                                className="text-red-600"
                                                            >
                                                                <XCircle className="text-red-600" />
                                                                Cancelar
                                                            </DropdownMenuItem>
                                                        </>
                                                    )
                                                ) : null}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            {removerReserva && (
                <DeleteItem
                    isOpen={(open) => {
                        if (!open) {
                            setRemoverReserva(null);
                        }
                    }}
                    itemName={removerReserva.titulo}
                    route={route('reservas.destroy', { reserva: removerReserva.id })}
                />
            )}
            {selectedReserva && (
                <ReservaDetalhes
                    isGestor={isGestor}
                    selectedReserva={selectedReserva}
                    setSelectedReserva={setSelectedReserva}
                    setRemoverReserva={setRemoverReserva} />
            )}
            {/**<Dialog
                    open={!!selectedReserva}
                    onOpenChange={(isOpen) => {
                        if (!isOpen) {
                            setSelectedReserva(undefined); // Fecha o dialog limpando o estado
                        }
                    }}
                >
                    <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                {selectedReserva.titulo}
                            </DialogTitle>
                            <DialogDescription className="flex-col justify-between">
                                <div className="flex items-center gap-2 p-1">
                                    <User className="h-4 w-4" />
                                    Solicitado por: {selectedReserva.user?.name}
                                </div>
                                <div className="flex items-center gap-2 p-1">
                                    <Home className="h-4 w-4" />
                                    Espaço: {selectedReserva.horarios[0]?.agenda?.espaco?.nome ?? ' '}
                                </div>
                                <div className="flex items-center gap-2 p-1">
                                    <SituacaoIndicator situacao={selectedReserva.situacao} />
                                </div>
                            </DialogDescription>
                        </DialogHeader>
                        <div>
                            <h4 className="mb-2 font-medium text-gray-900">Descrição</h4>
                            <p className="rounded-lg bg-gray-50 p-3 text-gray-700">{selectedReserva.descricao}</p>
                        </div>

                        <Separator />
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="flex items-center gap-2">
                                <CalendarDays className="h-4 w-4 text-gray-500" />
                                <div>
                                    <p className="text-sm text-gray-500">Período</p>
                                    <p className="font-medium">
                                        {formatDate(selectedReserva.data_inicial)} até {formatDate(selectedReserva.data_final)}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <Separator />

                        <Separator />

                        <div>
                            <h4 className="mb-3 flex items-center gap-2 font-medium text-gray-900">
                                <Clock className="h-4 w-4" />
                                Horários Solicitados
                            </h4>
                            <div className="grid gap-2">
                                {selectedReserva.horarios.map((horario) => {
                                    const dia = new Date(horario.data);
                                    return (
                                        <div key={horario.id} className="rounded-lg bg-blue-50 p-3">
                                            <div className="flex items-center justify-between rounded-lg p-3">
                                                <span className="font-medium text-blue-900">{diasSemanaParser[dia.getDay()]}</span>
                                                <span className="text-blue-700">
                                                    {horario.horario_inicio} às {horario.horario_fim}
                                                </span>
                                                {horario.pivot?.situacao && <SituacaoBadge situacao={horario.pivot.situacao} />}
                                            </div>
                                            {horario.pivot?.justificativa && horario.pivot?.situacao === 'indeferida' && (
                                                <div className="flex items-center justify-between bg-red-50 p-3">
                                                    <span className="font-medium text-red-900">Justificativa:</span>
                                                    <span className="text-red-700">
                                                        {horario.pivot?.justificativa
                                                            ? horario.pivot.justificativa
                                                            : 'Nenhuma justificativa fornecida'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setSelectedReserva(undefined)}>
                                Fechar
                            </Button>
                            {isGestor ? (
                                <div>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            router.get(`/gestor/reservas/${selectedReserva.id}`);
                                        }}
                                    >
                                        <Edit className="mr-1 h-4 w-4" />
                                        Avaliar
                                    </Button>
                                </div>
                            ) : (
                                <div>
                                    {selectedReserva.situacao === 'em_analise' && (
                                        <Button variant="outline" onClick={() => router.get(route('reservas.edit', selectedReserva.id))}>
                                            <Edit className="mr-1 h-4 w-4" />
                                            Editar
                                        </Button>
                                    )}
                                    <Button variant="destructive" onClick={() => setRemoverReserva(selectedReserva)}>
                                        <XCircle className="mr-1 h-4 w-4" />
                                        Cancelar
                                    </Button>
                                </div>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog> */}
            <div className="mt-4 flex justify-center">
                <div className="flex flex-wrap justify-center gap-1">
                    {links.map((link, index) =>
                        // Renderiza o link apenas se a URL não for nula
                        link.url ? (
                            <Link
                                key={index}
                                href={link.url}
                                preserveScroll
                                className={`rounded-md border px-4 py-2 text-sm transition-colors ${link.active ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-accent'
                                    }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ) : (
                            // Renderiza um span não clicável para "..." ou links desativados
                            <span
                                key={index}
                                className="text-muted-foreground rounded-md border px-4 py-2 text-sm"
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ),
                    )}
                </div>
            </div>
        </div>
    );
}
