import DeleteItem from '@/presentation/molecules/delete-item';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDate } from '@/lib/utils';
import { Paginator, Reserva, User as UserType } from '@/types';
import { router } from '@inertiajs/react';
import { format } from 'date-fns';
import { Edit, FileText, XCircle } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import ReservaDetalhes from '@/presentation/organisms/ReservasDetalhes';
import { SituacaoBadge } from '@/presentation/atoms/SituacaoBadge';
import { LocalReserva } from '@/presentation/molecules/LocalReserva';
import PaginacaoListas from '@/presentation/molecules/paginacao-listas';

import { sortReservasForGestor, sortReservasForUser } from '@/application/reservas/helpers/reserva-helpers';

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
        isGestor ? sortReservasForGestor(reservas) : sortReservasForUser(reservas)
    );

    useEffect(() => {
        if (reservaToShow) {
            setSelectedReserva(reservaToShow);
        } else {
            setSelectedReserva(undefined);
        }
    }, [reservaToShow]);

    useEffect(() => {
        setReservasFiltradas(
            isGestor ? sortReservasForGestor(reservas) : sortReservasForUser(reservas)
        );
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
        router.get(
            route(routeName),
            {
                reserva: reserva.id,
                // Pede ao backend a semana inicial da reserva
                semana: format(new Date(reserva.data_inicial), 'yyyy-MM-dd'),
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    // Função para FECHAR o modal de detalhes
    // Ela remove o parâmetro 'reserva' da URL
    const handleFecharDetalhes = () => {
        router.get(
            route(routeName),
            {
                // Mantém os filtros atuais da página, mas remove o filtro de 'reserva'
                ...route().params,
                reserva: undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
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
                                    <LocalReserva espaco={reserva.horarios[0]?.agenda?.espaco} />
                                </TableCell>

                                <TableCell className="hidden lg:table-cell">
                                    {formatDate(reserva.data_inicial)} à {formatDate(reserva.data_final)}
                                </TableCell>
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
                                                <Button onClick={() => handleAvaliarButton(reserva.id)} variant="outline">
                                                    <Edit className="h-4 w-4" />
                                                    {reserva.situacao === 'em_analise' ? 'Avaliar' : 'Reavaliar'}
                                                </Button>
                                            ) : (
                                                <>
                                                    {reserva.can_update && (
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
                                                    <Button onClick={() => setRemoverReserva(reserva)} variant="destructive">
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

            <PaginacaoListas links={links} />
        </div>
    );
}
