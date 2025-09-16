import DeleteItem from '@/components/delete-item';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDate, getStatusReservaColor, getStatusReservaText } from '@/lib/utils';
import { Paginator, Reserva, SituacaoReserva, User as UserType } from '@/types';
import { Link, router } from '@inertiajs/react';
import { CheckCircle, Clock, Edit, FileText, XCircle, XSquare } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import ReservaDetalhes from './ReservasDetalhes';
import { format } from 'date-fns';

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
    routeName: string;
}
// Componente principal da lista de reservas
export function ReservasList({ paginator, fallback, isGestor, user, reservaToShow, routeName }: ReservasListProps) {
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
        if (reservaToShow) {
            setSelectedReserva(reservaToShow);
        } else {
            setSelectedReserva(undefined);
        }
    }, [reservaToShow]);

    useEffect(() => {
        if (isGestor) {
            const reservasParaExibir = reservas.map((reserva) => {
                if (reserva.situacao === 'parcialmente_deferida' || reserva.situacao === 'em_analise') {
                    const situacoes = reserva.horarios.map((horario) => horario.situacao);
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

    if (reservas.length === 0) {
        return fallback;
    }
    const handleAvaliarButton = (id: number) => {
        router.get(route('gestor.reservas.show', id));
    };


    // Função para ABRIR o modal de detalhes
    // Ela faz uma requisição para buscar os dados completos da reserva
    const handleAbrirDetalhes = (reserva: Reserva) => {
        router.get(route(routeName), {
            reserva: reserva.id,
            // Pede ao backend a semana inicial da reserva
            semana: format(new Date(reserva.data_inicial), 'yyyy-MM-dd'),
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    // Função para FECHAR o modal de detalhes
    // Ela remove o parâmetro 'reserva' da URL
    const handleFecharDetalhes = () => {
        router.get(route(routeName), {
            // Mantém os filtros atuais da página, mas remove o filtro de 'reserva'
            ...route().params,
            reserva: undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    return (
        <div className="space-y-4">
            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Título</TableHead>
                            <TableHead className="hidden md:table-cell">Local</TableHead>
                            <TableHead className="hidden lg:table-cell">Periodo</TableHead>
                            <TableHead className="hidden md:table-cell">Situação</TableHead>
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
                                    <div>
                                        <p>
                                            {reserva.horarios[0]?.agenda?.espaco?.nome ?? ' '}
                                        </p>
                                    </div>
                                </TableCell>

                                <TableCell className="hidden lg:table-cell">{formatDate(reserva.data_inicial)} à {formatDate(reserva.data_final)}</TableCell>
                                <TableCell className="hidden md:table-cell">
                                    <div>
                                        <SituacaoBadge situacao={reserva.situacao} />
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2 pt-2" key={reserva.id}>
                                        {/* ALTERADO: O botão agora chama a função handleAbrirDetalhes */}
                                        <Button variant="outline" onClick={() => handleAbrirDetalhes(reserva)}>
                                            <FileText className="mr-2 h-4 w-4" />
                                            Detalhes
                                        </Button>


                                        {reserva.situacao !== 'inativa' ? (
                                            isGestor ? (
                                                <Button
                                                    onClick={() => handleAvaliarButton(reserva.id)}
                                                    variant="outline"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                    {reserva.situacao === 'em_analise' ? 'Avaliar' : 'Reavaliar'}
                                                </Button>
                                            ) : (
                                                <>
                                                    {reserva.situacao === 'em_analise' && (
                                                        <Button
                                                            onClick={() => {
                                                                router.get(`reservas/${reserva.id}/edit`);
                                                            }}
                                                            variant="outline"
                                                        >
                                                            <Edit />
                                                            Editar
                                                        </Button>
                                                    )}
                                                    <Button
                                                        onClick={() => setRemoverReserva(reserva)}
                                                        variant="destructive"
                                                    >
                                                        <XCircle className="text-white" />
                                                        Cancelar
                                                    </Button>
                                                </>
                                            )
                                        ) : null}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            {selectedReserva && (
                <ReservaDetalhes
                    isOpen={!!selectedReserva}
                    onOpenChange={(open) => {
                        if (!open) {
                            handleFecharDetalhes();
                        }
                    }}
                    isGestor={isGestor}
                    selectedReserva={selectedReserva}
                    setRemoverReserva={setRemoverReserva}
                    routeName={routeName}
                />
            )}
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
