'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAndarLabelByValue } from '@/lib/utils/andars/AndarOptions';

interface AndarSummaryProps {
    andares: {
        nome: string;
        tipo_acesso: string[];
    }[];
}

const tiposDeAcessoLabels: Record<string, string> = {
    terreo: 'Térreo',
    escada: 'Escada',
    elevador: 'Elevador',
    rampa: 'Rampa',
};

export default function AndarSummary({ andares }: AndarSummaryProps) {
    if (andares.length === 0) {
        return null;
    }

    // Ordenar andares por número (subsolo primeiro, depois térreo, depois andares superiores)
    const andaresOrdenados = [...andares].sort((a, b) => {
        const getNumero = (nome: string) => {
            if (nome.startsWith('subsolo-')) {
                return -Number.parseInt(nome.split('-')[1]);
            }
            if (nome === 'terreo') {
                return 0;
            }
            if (nome.startsWith('andar-')) {
                return Number.parseInt(nome.split('-')[1]);
            }
            return 999; // fallback
        };

        return getNumero(a.nome) - getNumero(b.nome);
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Resumo dos Andares</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {andaresOrdenados.map((andar, index) => (
                        <div key={index} className="bg-muted/50 flex items-center justify-between rounded-lg p-3">
                            <div className="font-medium">{getAndarLabelByValue(andar.nome)}</div>
                            <div className="flex flex-wrap gap-1">
                                {andar.tipo_acesso.map((tipo) => (
                                    <Badge key={tipo} variant="secondary" className="text-xs">
                                        {tiposDeAcessoLabels[tipo] || tipo}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
