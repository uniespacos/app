import { TURNO_LABEL, type Turno } from '@/constants/turnos';
import { cn } from '@/lib/utils';
import { Horario } from '@/types';
import { CheckCircle2, Clock } from 'lucide-react';
import { useMemo } from 'react';

interface AvaliacaoGestoresResumoProps {
    horarios: Horario[];
}

interface ResumoTurno {
    agendaId: number;
    turno: Turno;
    gestor: string;
    total: number;
    avaliados: number;
    avaliadoPor: string[];
}

export default function AvaliacaoGestoresResumo({ horarios }: AvaliacaoGestoresResumoProps) {
    const resumos = useMemo(() => {
        const porAgenda = new Map<number, ResumoTurno>();

        horarios.forEach((horario) => {
            const agenda = horario.agenda;
            if (!agenda) {
                return;
            }

            const atual = porAgenda.get(agenda.id) ?? {
                agendaId: agenda.id,
                turno: agenda.turno,
                gestor: agenda.user?.name ?? 'Gestor não definido',
                total: 0,
                avaliados: 0,
                avaliadoPor: [],
            };

            atual.total += 1;
            if (horario.situacao !== 'em_analise') {
                atual.avaliados += 1;
                if (horario.avaliador && !atual.avaliadoPor.includes(horario.avaliador.name)) {
                    atual.avaliadoPor.push(horario.avaliador.name);
                }
            }

            porAgenda.set(agenda.id, atual);
        });

        return [...porAgenda.values()].sort((a, b) => a.turno.localeCompare(b.turno));
    }, [horarios]);

    if (resumos.length === 0) {
        return null;
    }

    return (
        <div className="space-y-2">
            <h4 className="text-foreground font-medium">Avaliação dos gestores</h4>
            <ul className="flex flex-col flex-wrap gap-2 sm:flex-row">
                {resumos.map((resumo) => {
                    const completo = resumo.avaliados === resumo.total;

                    return (
                        <li
                            key={resumo.agendaId}
                            className={cn(
                                'flex items-start gap-2 rounded-lg border p-2 text-sm sm:min-w-56',
                                completo ? 'border-success-accent/30 bg-success-subtle' : 'border-warning-accent/30 bg-warning-subtle',
                            )}
                        >
                            {completo ? (
                                <CheckCircle2 className="text-success-accent mt-0.5 h-4 w-4 shrink-0" />
                            ) : (
                                <Clock className="text-warning-accent mt-0.5 h-4 w-4 shrink-0" />
                            )}
                            <div className="min-w-0">
                                <p className="text-foreground truncate font-medium">
                                    {TURNO_LABEL[resumo.turno] ?? resumo.turno} — {resumo.gestor}
                                </p>
                                <p className={cn('text-xs font-semibold', completo ? 'text-success-accent' : 'text-warning-accent')}>
                                    {completo
                                        ? resumo.avaliadoPor.length > 0
                                            ? `Avaliado por ${resumo.avaliadoPor.join(', ')}`
                                            : 'Avaliado'
                                        : `Aguardando — ${resumo.avaliados}/${resumo.total} horários`}
                                </p>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
