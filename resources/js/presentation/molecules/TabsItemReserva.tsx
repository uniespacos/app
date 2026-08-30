import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/i18n';
import { formatDate } from '@/i18n/formatters';
import { getAndarLabelByValue } from '@/lib/utils/andars/AndarOptions';
import { SituacaoBadge } from '@/presentation/atoms/SituacaoBadge';
import { Reserva } from '@/types';
import { router } from '@inertiajs/react';
import { FileText } from 'lucide-react';

export default function TabsItemReserva({ reservas }: { reservas: Reserva[] }) {
    const { t } = useTranslation();
    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('dashboard.reservas_recentes.titulo')}</CardTitle>
                <CardDescription>{t('dashboard.reservas_recentes.descricao')}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {reservas.map((reserva) => {
                        const espaco = reserva.horarios[0]?.agenda?.espaco;
                        return (
                            <div
                                key={reserva.id}
                                className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div className="min-w-0 space-y-1">
                                    <h4 className="truncate font-medium">{reserva.titulo}</h4>
                                    <p className="text-muted-foreground truncate text-sm">
                                        {espaco?.nome} - {espaco?.andar?.nome ? getAndarLabelByValue(espaco.andar.nome) : null},{' '}
                                        {espaco?.andar?.modulo?.nome}
                                    </p>
                                    <p className="text-muted-foreground text-xs">{formatDate(reserva.data_inicial)}</p>
                                </div>
                                <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-start">
                                    <SituacaoBadge situacao={reserva.situacao} />
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            router.get(route('reservas.index', { reserva: reserva.id }));
                                        }}
                                        className="sm:mt-5"
                                    >
                                        <FileText className="mr-1 h-4 w-4" />
                                        {t('reservas.acoes.ver_detalhes')}
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
