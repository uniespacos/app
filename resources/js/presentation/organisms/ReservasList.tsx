import { comSituacaoEfetivaDoGestor } from '@/application/reservas/helpers/reserva-helpers';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { formatDate } from '@/lib/utils';
import { SituacaoBadge } from '@/presentation/atoms/SituacaoBadge';
import { ColumnDef, DataTable } from '@/presentation/molecules/DataTable';
import DeleteItem from '@/presentation/molecules/delete-item';
import { LocalReserva } from '@/presentation/molecules/LocalReserva';
import { ReservaCardMobile } from '@/presentation/molecules/ReservaCardMobile';
import { ViewMode, ViewModeToggle } from '@/presentation/molecules/ViewModeToggle';
import ReservaDetalhes from '@/presentation/organisms/ReservasDetalhes';
import { Paginator, Reserva, User as UserType } from '@/types';
import { router } from '@inertiajs/react';
import { format } from 'date-fns';
import { Edit, FileText, XCircle } from 'lucide-react';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';

interface ReservasListProps {
    reservaToShow?: Reserva | undefined;
    paginator: Paginator<Reserva>;
    fallback: React.ReactNode;
    isGestor: boolean;
    user?: UserType;
    routeName: string;
}

export function ReservasList({ paginator, fallback, isGestor, reservaToShow, routeName }: ReservasListProps) {
    const { data: reservas, links } = paginator;
    const isMobile = useIsMobile();
    const [viewMode, setViewMode] = useState<ViewMode>(isMobile ? 'grid' : 'table');
    const [selectedReserva, setSelectedReserva] = useState<Reserva | undefined>(undefined);
    const [removerReserva, setRemoverReserva] = useState<Reserva | null>(null);

    const reservasFiltradas = useMemo(() => (isGestor ? comSituacaoEfetivaDoGestor(reservas) : reservas), [isGestor, reservas]);

    useEffect(() => {
        if (reservaToShow) {
            setSelectedReserva(reservaToShow);
        } else {
            setSelectedReserva(undefined);
        }
    }, [reservaToShow]);

    if (reservas.length === 0) {
        return fallback;
    }

    const handleAvaliarButton = (id: number) => {
        router.get(route('gestor.reservas.show', id));
    };

    const handleAbrirDetalhes = (reserva: Reserva) => {
        router.get(
            route(routeName),
            {
                reserva: reserva.id,
                semana: format(new Date(reserva.data_inicial), 'yyyy-MM-dd'),
            },
            {
                preserveState: true,
                preserveScroll: true,
                only: ['reservaToShow', 'weekEvents'],
            },
        );
    };

    const handleFecharDetalhes = () => {
        setSelectedReserva(undefined);
        router.get(
            route(routeName),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                only: ['reservaToShow', 'weekEvents'],
            },
        );
    };

    const renderActions = (reserva: Reserva) => (
        <div className="flex flex-wrap justify-end gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={() => {
                    handleAbrirDetalhes(reserva);
                }}
            >
                <FileText className="mr-1.5 h-4 w-4" />
                Detalhes
            </Button>

            {reserva.situacao !== 'inativa' ? (
                isGestor ? (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            handleAvaliarButton(reserva.id);
                        }}
                    >
                        <Edit className="mr-1.5 h-4 w-4" />
                        {reserva.situacao === 'em_analise' ? 'Avaliar' : 'Reavaliar'}
                    </Button>
                ) : (
                    <>
                        {reserva.can_update && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    router.get(`reservas/${String(reserva.id)}/edit`);
                                }}
                            >
                                <Edit className="mr-1.5 h-4 w-4" />
                                Editar
                            </Button>
                        )}
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                                setRemoverReserva(reserva);
                            }}
                        >
                            <XCircle className="mr-1.5 h-4 w-4" />
                            Cancelar
                        </Button>
                    </>
                )
            ) : null}
        </div>
    );

    const columns: ColumnDef<Reserva>[] = [
        {
            header: 'Título',
            cell: (reserva) => (
                <div>
                    <div className="font-medium">
                        {reserva.titulo.substring(0, 30)}
                        {reserva.titulo.length > 30 ? '...' : ''}
                    </div>
                    {reserva.descricao ? (
                        <p className="text-muted-foreground hidden text-sm sm:block">
                            {reserva.descricao.substring(0, 30)}
                            {reserva.descricao.length > 30 ? '...' : ''}
                        </p>
                    ) : null}
                </div>
            ),
        },
        {
            header: 'Local',
            className: 'hidden md:table-cell',
            cell: (reserva) => <LocalReserva espaco={reserva.horarios[0]?.agenda?.espaco} />,
        },
        {
            header: 'Período',
            className: 'hidden lg:table-cell',
            cell: (reserva) => `${formatDate(reserva.data_inicial)} à ${formatDate(reserva.data_final)}`,
        },
        {
            header: 'Situação',
            className: 'hidden md:table-cell',
            cell: (reserva) => <SituacaoBadge situacao={reserva.situacao} />,
        },
    ];

    const renderCard = (reserva: Reserva) => (
        <ReservaCardMobile
            key={reserva.id}
            reserva={reserva}
            isGestor={isGestor}
            onDetalhes={handleAbrirDetalhes}
            onAvaliar={handleAvaliarButton}
            onEditar={(id) => {
                router.get(`reservas/${String(id)}/edit`);
            }}
            onCancelar={setRemoverReserva}
        />
    );

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
            </div>

            <DataTable
                data={reservasFiltradas}
                columns={columns}
                viewMode={viewMode}
                renderCard={renderCard}
                gridClassName="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                pagination={{ links }}
                cardWrapper={false}
                actions={renderActions}
            />

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
        </div>
    );
}
