import { SituacaoBadge } from '@/pages/Reservas/fragments/ReservasList';
import { Reserva } from '@/types';
import { router } from '@inertiajs/react';
import { CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

export default function TabsItemReserva({ reservas }: { reservas: Reserva[] }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Reservas Recentes</CardTitle>
                <CardDescription>Suas últimas solicitações de reserva</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {reservas.map((reserva) => {
                        const espaco = reserva.horarios[0]?.agenda?.espaco;
                        return (
                            <div key={reserva.id} className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-1">
                                    <h4 className="font-medium">{reserva.titulo}</h4>
                                    <p className="text-muted-foreground text-sm">
                                        {espaco?.nome} - {espaco?.andar?.nome}, {espaco?.andar?.modulo?.nome}
                                    </p>
                                    <p className="text-muted-foreground text-xs">{new Date(reserva.data_inicial).toLocaleDateString('pt-BR')}</p>
                                </div>
                                <div className="flex-col">
                                    <SituacaoBadge situacao={reserva.situacao} />
                                    <Button
                                        size="sm"
                                        onClick={() => router.get(route('reservas.index', { reserva: reserva.id }))}
                                        className="mt-5 bg-blue-600 hover:bg-blue-700"
                                    >
                                        <CheckCircle className="mr-1 h-4 w-4" />
                                        Ver detalhes
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
