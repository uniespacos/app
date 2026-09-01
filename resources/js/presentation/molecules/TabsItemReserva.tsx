import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/i18n';
import { ReservaCardMobile } from '@/presentation/molecules/ReservaCardMobile';
import { Reserva } from '@/types';
import { router } from '@inertiajs/react';

export default function TabsItemReserva({ reservas }: { reservas: Reserva[] }) {
    const { t } = useTranslation();
    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('dashboard.reservas_recentes.titulo')}</CardTitle>
                <CardDescription>{t('dashboard.reservas_recentes.descricao')}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {reservas.map((reserva) => (
                        <ReservaCardMobile
                            key={reserva.id}
                            reserva={reserva}
                            onDetalhes={(reservaSelecionada) => {
                                router.get(route('reservas.index', { reserva: reservaSelecionada.id }));
                            }}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
