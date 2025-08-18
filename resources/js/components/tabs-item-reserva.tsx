import { SituacaoBadge } from "@/pages/Reservas/fragments/ReservasList";
import { Button } from "./ui/button";
import { CheckCircle } from "lucide-react";
import { router } from "@inertiajs/react";
import { Reserva } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

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
                            <div key={reserva.id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="space-y-1">
                                    <h4 className="font-medium">{reserva.titulo}</h4>
                                    <p className="text-sm text-muted-foreground">
                                        {espaco?.nome} - {espaco?.andar?.nome}, {espaco?.andar?.modulo?.nome}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(reserva.data_inicial).toLocaleDateString("pt-BR")}
                                    </p>
                                </div>
                                <div className="flex-col ">
                                    <SituacaoBadge situacao={reserva.situacao} />
                                    <Button
                                        size="sm"
                                        onClick={() => router.get(route('reservas.index', { reserva: reserva.id }))}
                                        className="bg-blue-600 hover:bg-blue-700 mt-5"
                                    >
                                        <CheckCircle className="mr-1 h-4 w-4" />
                                        Ver detalhes
                                    </Button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}
