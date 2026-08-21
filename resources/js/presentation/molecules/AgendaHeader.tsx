import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TURNOS_ORDENADOS, TURNO_LABEL } from '@/constants/turnos';
import { AgendaGestoresPorTurnoType, Espaco } from '@/types';
import { Building2, Home, MapPin, User, Users } from 'lucide-react';

type AgendaHeaderProps = {
    espaco: Espaco;
    gestoresPorTurno: Map<string, AgendaGestoresPorTurnoType>;
};

export default function AgendaHeader({ espaco, gestoresPorTurno }: AgendaHeaderProps) {
    return (
        <Card className="shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xl">
                    <Home className="h-5 w-5" />
                    {espaco.nome}
                </CardTitle>
            </CardHeader>
            <CardContent className="pb-3">
                <div className="mb-3 flex flex-wrap gap-2">
                    <Badge variant="outline" className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {espaco.andar?.modulo?.nome}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {espaco.andar?.nome}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {espaco.capacidade_pessoas} pessoas
                    </Badge>
                </div>
                {espaco.descricao && (
                    <div className="mb-3">
                        <h4 className="text-muted-foreground mb-1.5 text-xs font-semibold tracking-wide uppercase">Descrição</h4>
                        <p className="bg-muted/50 text-muted-foreground rounded-lg p-3 text-sm leading-relaxed">{espaco.descricao}</p>
                    </div>
                )}
                <div className="border-t pt-3">
                    <h3 className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">Gestores por turno</h3>

                    {/*
                        Antes: grid-cols-1 com `justify-center` e rótulo "MANHA:" colado
                        ao nome. Nomes longos ("Comissão de Residência Multiprofissional
                        de Saúde - COREMU") quebravam em duas linhas centralizadas e o
                        rótulo ficava boiando fora de eixo. Rótulo em largura fixa e
                        texto alinhado à esquerda mantêm a coluna reta qualquer que seja
                        o tamanho do nome.

                        A ordem vem de TURNOS_ORDENADOS (issue #101) em vez de um array
                        literal, e o rótulo de TURNO_LABEL — "MANHA" sem til era
                        `turno.toUpperCase()` cru.
                    */}
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-3">
                        {TURNOS_ORDENADOS.map((turno) => {
                            const gestor = gestoresPorTurno.get(turno);

                            return (
                                <div key={turno} className="flex items-start gap-2 text-sm sm:flex-col sm:gap-1">
                                    <dt className="text-muted-foreground w-16 shrink-0 text-xs font-semibold sm:w-auto">{TURNO_LABEL[turno]}</dt>
                                    <dd className="flex min-w-0 flex-1 items-start gap-1.5">
                                        <User className="text-muted-foreground mt-0.5 h-3.5 w-3.5 shrink-0" />
                                        {gestor ? (
                                            <div className="min-w-0">
                                                <p className="text-sm leading-snug break-words">{gestor.nome}</p>
                                                {/* Tooltip é inalcançável no toque, então
                                                    e-mail e setor ficam visíveis. */}
                                                {gestor.email && <p className="text-muted-foreground text-xs break-all">{gestor.email}</p>}
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground text-sm">Sem gestor</span>
                                        )}
                                    </dd>
                                </div>
                            );
                        })}
                    </dl>
                </div>
            </CardContent>
        </Card>
    );
}
