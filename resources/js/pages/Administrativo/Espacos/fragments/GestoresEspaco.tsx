import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { Agenda } from '@/types';

interface GestoresEspacoProps {
    agendas?: Agenda[];
}

export function GestoresEspaco({ agendas }: GestoresEspacoProps) {
    if (!agendas || agendas.length === 0) {
        return <span className="text-muted-foreground text-sm">Nenhum gestor</span>;
    }

    const turnos = {
        manha: 'Manhã',
        tarde: 'Tarde',
        noite: 'Noite',
    };

    return (
        <div className="flex flex-col gap-1">
            {agendas.map((agenda) => (
                <div key={agenda.id} className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                        {turnos[agenda.turno]}
                    </Badge>
                    {agenda.user ? (
                        <div className="flex items-center gap-1">
                            <Avatar className="h-5 w-5">
                                <AvatarFallback className="text-xs">
                                    {agenda.user.name
                                        .split(' ')
                                        .map((n) => n[0])
                                        .join('')
                                        .slice(0, 2)}
                                </AvatarFallback>
                            </Avatar>
                            <span className="max-w-[120px] truncate text-sm">{agenda.user.name}</span>
                        </div>
                    ) : (
                        <span className="text-muted-foreground text-xs">Sem gestor</span>
                    )}
                </div>
            ))}
        </div>
    );
}
