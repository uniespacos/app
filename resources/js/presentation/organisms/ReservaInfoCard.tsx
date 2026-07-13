import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatDate } from '@/lib/utils';
import { Reserva } from '@/types';
import { CalendarDays, FileText, User } from 'lucide-react';
import { ReactNode } from 'react';

interface ReservaInfoCardProps {
    reserva: Reserva;
    children?: ReactNode;
}

export function ReservaInfoCard({ reserva, children }: ReservaInfoCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {reserva.titulo}
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Solicitado por: {reserva.user?.name}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h4 className="mb-2 font-medium text-gray-900">Descrição</h4>
                    <p className="rounded-lg bg-gray-50 p-3 text-gray-700">{reserva.descricao}</p>
                </div>
                <Separator />
                <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-gray-500" />
                    <div>
                        <p className="text-sm text-gray-500">Período</p>
                        <p className="font-medium">
                            {formatDate(reserva.data_inicial)} até {formatDate(reserva.data_final)}
                        </p>
                    </div>
                </div>
                {children && (
                    <>
                        <Separator />
                        {children}
                    </>
                )}
            </CardContent>
        </Card>
    );
}
