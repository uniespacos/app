import { comSituacaoEfetivaDoGestor } from '@/application/reservas/helpers/reserva-helpers';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useIsMobile } from '@/hooks/use-mobile';
import { formatDate } from '@/lib/utils';
import { SituacaoBadge } from '@/presentation/atoms/SituacaoBadge';
import { ColumnDef, DataTable } from '@/presentation/molecules/DataTable';
import DeleteItem from '@/presentation/molecules/delete-item';
import { LocalReserva } from '@/presentation/molecules/LocalReserva';
import { ReservaCardMobile } from '@/presentation/molecules/ReservaCardMobile';
import { ViewMode } from '@/presentation/molecules/ViewModeToggle';
import ReservaDetalhes from '@/presentation/organisms/ReservasDetalhes';
import { Paginator, Reserva, User as UserType } from '@/types';
import { router } from '@inertiajs/react';
import { format } from 'date-fns';
import { Edit, FileText, MoreHorizontal, XCircle } from 'lucide-react';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';

interface ReservasListProps {
    reservaToShow?: Reserva | undefined;
    paginator: Paginator<Reserva>;
    fallback: React.ReactNode;
    isGestor: boolean;
    user?: UserType;
    routeName: string;
    viewMode?: ViewMode;
}

export function ReservasList({ paginator, fallback, isGestor, reservaToShow, routeName, viewMode: controlledViewMode }: ReservasListProps) {
    const { data: reservas, links } = paginator;
    const isMobile = useIsMobile();
    const [internalViewMode] = useState<ViewMode>(isMobile ? 'grid' : 'table');
    const viewMode = controlledViewMode ?? internalViewMode;

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

    const renderActions = (reserva: Reserva) => {
        const canEdit = Boolean(!isGestor && reserva.situacao !== 'inativa' && (reserva.can_update ?? false));
        const canCancel = !isGestor && reserva.situacao !== 'inativa';
        const isGestorEvaluable = isGestor && reserva.situacao !== 'inativa';

        return (
            <div className="flex items-center justify-end gap-1.5">
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1 px-2.5 text-xs font-medium"
                    onClick={() => {
                        handleAbrirDetalhes(reserva);
                    }}
                >
                    <FileText className="h-3.5 w-3.5" />
                    Detalhes
                </Button>

                {isGestorEvaluable && (
                    <Button
                        variant="default"
                        size="sm"
                        className="h-8 gap-1 px-2.5 text-xs font-medium"
                        onClick={() => {
                            handleAvaliarButton(reserva.id);
                        }}
                    >
                        <Edit className="h-3.5 w-3.5" />
                        {reserva.situacao === 'em_analise' ? 'Avaliar' : 'Reavaliar'}
                    </Button>
                )}

                {(canEdit || canCancel) && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Mais ações</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {canEdit && (
                                <DropdownMenuItem
                                    onClick={() => {
                                        router.get(`reservas/${String(reserva.id)}/edit`);
                                    }}
                                >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Editar
                                </DropdownMenuItem>
                            )}
                            {canCancel && (
                                <DropdownMenuItem
                                    onClick={() => {
                                        setRemoverReserva(reserva);
                                    }}
                                    className="text-destructive focus:text-destructive"
                                >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Cancelar
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        );
    };

    const columns: ColumnDef<Reserva>[] = [
        {
            header: 'Título',
            className: 'min-w-[180px]',
            cell: (reserva) => (
                <div className="min-w-0 space-y-0.5">
                    <div className="text-foreground truncate font-semibold" title={reserva.titulo}>
                        {reserva.titulo}
                    </div>
                    {reserva.descricao ? (
                        <p className="text-muted-foreground line-clamp-1 truncate text-xs" title={reserva.descricao}>
                            {reserva.descricao}
                        </p>
                    ) : null}
                    {isGestor && reserva.user ? (
                        <p className="text-muted-foreground truncate text-xs">
                            <span className="font-medium">Solicitante:</span> {reserva.user.name}
                        </p>
                    ) : null}
                </div>
            ),
        },
        {
            header: 'Local',
            className: 'min-w-[160px]',
            cell: (reserva) => <LocalReserva espaco={reserva.horarios[0]?.agenda?.espaco} />,
        },
        {
            header: 'Período',
            className: 'min-w-[130px] whitespace-nowrap',
            cell: (reserva) => (
                <div className="text-sm">
                    <div className="font-medium">{formatDate(reserva.data_inicial)}</div>
                    {reserva.data_inicial !== reserva.data_final && (
                        <div className="text-muted-foreground text-xs">até {formatDate(reserva.data_final)}</div>
                    )}
                </div>
            ),
        },
        {
            header: 'Situação',
            align: 'center',
            className: 'w-[150px]',
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
