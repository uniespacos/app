import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAndarLabelByValue } from '@/lib/utils/andars/AndarOptions';
import { SituacaoBadge } from '@/presentation/atoms/SituacaoBadge';
import { Reserva } from '@/types';
import { router } from '@inertiajs/react';
import { FileText } from 'lucide-react';

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
                                    <p className="text-muted-foreground text-xs">{new Date(reserva.data_inicial).toLocaleDateString('pt-BR')}</p>
                                </div>
                                {/* Coluna de status/ação: mesmo padrão outline+FileText da
                                    listagem de reservas (ReservasList) — o botão azul sólido
                                    com ícone de check parecia uma ação de aprovar, não de ver. */}
                                <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-start">
                                    <SituacaoBadge situacao={reserva.situacao} />
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => router.get(route('reservas.index', { reserva: reserva.id }))}
                                        className="sm:mt-5"
                                    >
                                        <FileText className="mr-1 h-4 w-4" />
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
