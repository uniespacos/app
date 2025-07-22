import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AgendaGestoresPorTurnoType, Espaco } from '@/types';
import { Building2, Home, MapPin, User, Users } from 'lucide-react';

type AgendaHeaderProps = {
    espaco: Espaco;
    gestoresPorTurno: AgendaGestoresPorTurnoType;
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
                <div className="border-t pt-2">
                    <h3 className="mb-2 text-xs font-medium">Gestores por Turno:</h3>
                    <div className="mx-auto grid max-w-3xl grid-cols-1 gap-2 sm:grid-cols-3">
                        {['manha', 'tarde', 'noite'].map((turno) => (
                            <TooltipProvider key={turno}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className={`flex items-center justify-center gap-2 rounded-md p-1 text-xs transition-colors`}>
                                            <div className="font-semibold">{turno.toUpperCase()}:</div>
                                            <div className="flex items-center gap-1">
                                                <User className="text-muted-foreground h-3 w-3" />
                                                <span>{gestoresPorTurno[turno]?.nome ?? 'N/A'}</span>
                                            </div>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {gestoresPorTurno[turno] ? (
                                            <div className="space-y-1">
                                                <p className="font-medium">{gestoresPorTurno[turno].nome}</p>
                                                <p className="text-xs">{gestoresPorTurno[turno].email}</p>
                                                <p className="text-muted-foreground text-xs">{gestoresPorTurno[turno].departamento}</p>
                                            </div>
                                        ) : (
                                            <p>Nenhum gestor para este turno.</p>
                                        )}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
