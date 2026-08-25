import React, { useMemo } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Repeat, Info } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { DatePicker } from '@/presentation/molecules/DatePicker';
import { ReservaConflictAlert } from '@/presentation/molecules/ReservaConflictAlert';
import { opcoesRecorrencia } from '@/constants/recorrencia';
import { Espaco, SlotCalendario } from '@/types';
import { ReservaFormData } from '@/types/reserva-stepper';
import { cn } from '@/lib/utils';

export interface StepHorariosRecorrenciaProps {
    espaco: Espaco;
    formData: ReservaFormData;
    setFormData: (key: keyof ReservaFormData, value: unknown) => void;
    slotsSelecao: SlotCalendario[];
    hoje: Date;
    isEditMode?: boolean;
    conflictingDates?: string[];
    onConflictDetected?: (hasConflict: boolean) => void;
    setSlotsSelecao?: (slots: SlotCalendario[]) => void;
    showRecurrenceAlert?: boolean;
}

interface GrupoDiaSlot {
    data: Date;
    slots: SlotCalendario[];
}

function OpcaoRadioCard({
    value,
    id,
    titulo,
    descricao,
    selecionado,
}: {
    value: string;
    id: string;
    titulo: string;
    descricao?: string;
    selecionado: boolean;
}) {
    return (
        <Label
            htmlFor={id}
            className={cn(
                'flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-all duration-200',
                selecionado
                    ? 'border-primary bg-primary/10 ring-primary/30 shadow-xs ring-1'
                    : 'border-border hover:bg-muted/40 hover:border-border/80',
            )}
        >
            <RadioGroupItem value={value} id={id} className="mt-0.5" />
            <div className="grid gap-0.5">
                <span className="text-foreground text-xs font-medium sm:text-sm">{titulo}</span>
                {descricao && <span className="text-muted-foreground text-[11px] leading-tight">{descricao}</span>}
            </div>
        </Label>
    );
}

export const StepHorariosRecorrencia: React.FC<StepHorariosRecorrenciaProps> = ({
    espaco,
    formData,
    setFormData,
    slotsSelecao,
    hoje,
    isEditMode = false,
    conflictingDates = [],
    onConflictDetected,
    setSlotsSelecao,
    showRecurrenceAlert = false,
}) => {
    // Agrupamento dos slots por dia para visualização ordenada
    const slotsAgrupadosPorDia = useMemo(() => {
        const agrupamento: Record<string, GrupoDiaSlot | undefined> = {};

        slotsSelecao.forEach((slot) => {
            const dataObj = slot.data;
            const diaKey = format(dataObj, 'yyyy-MM-dd');
            const grupo = agrupamento[diaKey];

            if (!grupo) {
                agrupamento[diaKey] = {
                    data: dataObj,
                    slots: [slot],
                };
            } else {
                grupo.slots.push(slot);
            }
        });

        const listaGrupos: Record<string, GrupoDiaSlot> = {};
        Object.entries(agrupamento).forEach(([key, val]) => {
            if (val) {
                val.slots.sort((a, b) => a.horario_inicio.localeCompare(b.horario_inicio));
                listaGrupos[key] = val;
            }
        });

        return listaGrupos;
    }, [slotsSelecao]);

    const periodoFormatado = useMemo(() => {
        const dataIni = formData.data_inicial ? new Date(formData.data_inicial) : null;
        const dataFim = formData.data_final ? new Date(formData.data_final) : null;

        return {
            inicio: dataIni ? format(dataIni, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : 'Não definida',
            fim: dataFim ? format(dataFim, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : 'Não definida',
        };
    }, [formData.data_inicial, formData.data_final]);

    const handleDataInicialChange = (date: Date | undefined) => {
        if (!date) return;
        const oldDate = formData.data_inicial ? new Date(formData.data_inicial) : null;

        if (oldDate) {
            const diffTime = date.getTime() - oldDate.getTime();
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays !== 0 && setSlotsSelecao) {
                const newSlots = slotsSelecao.map((s) => {
                    const d = new Date(s.data);
                    d.setDate(d.getDate() + diffDays);
                    return {
                        ...s,
                        data: d,
                        id: `${format(d, 'yyyy-MM-dd')}|${s.horario_inicio}`,
                    };
                });
                setSlotsSelecao(newSlots);
            }
        }
        setFormData('data_inicial', date);
    };

    return (
        <div className="space-y-4">
            {/* Alerta de Conflitos em Tempo Real ou Conflitos Existentes */}
            <ReservaConflictAlert
                espacoId={espaco.id}
                selectedSlots={slotsSelecao}
                conflictingDates={conflictingDates}
                onConflictDetected={onConflictDetected}
            />

            {/* Escopo de Edição (apenas em isEditMode) */}
            {isEditMode && (
                <div className="bg-card border-border/80 space-y-2 rounded-xl border p-3.5 shadow-xs">
                    <Label className="text-foreground flex items-center gap-1.5 text-xs font-semibold">
                        <Repeat className="text-primary h-3.5 w-3.5" />
                        Escopo da Edição
                    </Label>
                    <RadioGroup
                        value={formData.edit_scope ?? 'recurring'}
                        onValueChange={(v) => {
                            setFormData('edit_scope', v);
                        }}
                        className="grid grid-cols-1 gap-2 sm:grid-cols-2"
                    >
                        <OpcaoRadioCard
                            value="recurring"
                            id="edit-scope-recurring"
                            titulo="Todas as ocorrências"
                            descricao="Aplica alterações a todo o ciclo da reserva"
                            selecionado={formData.edit_scope === 'recurring'}
                        />
                        <OpcaoRadioCard
                            value="single"
                            id="edit-scope-single"
                            titulo="Apenas esta semana"
                            descricao="Altera exclusivamente os horários da semana visível"
                            selecionado={formData.edit_scope === 'single'}
                        />
                    </RadioGroup>
                </div>
            )}

            {/* Seleção do Padrão de Recorrência */}
            <div className="space-y-2">
                <Label className="text-foreground flex items-center gap-1.5 text-xs font-semibold">
                    <Repeat className="text-primary h-3.5 w-3.5" />
                    Padrão de Recorrência
                </Label>
                <RadioGroup
                    value={formData.recorrencia}
                    onValueChange={(v) => {
                        setFormData('recorrencia', v);
                    }}
                    className="grid grid-cols-1 gap-2 sm:grid-cols-2"
                >
                    {opcoesRecorrencia.map((opcao) => (
                        <OpcaoRadioCard
                            key={opcao.valor}
                            value={opcao.valor}
                            id={`rec-${opcao.valor}`}
                            titulo={opcao.label}
                            descricao={opcao.descricao}
                            selecionado={formData.recorrencia === opcao.valor}
                        />
                    ))}
                </RadioGroup>
            </div>

            {/* Seletor de Intervalo de Datas */}
            <div className="bg-muted/30 border-border/70 grid grid-cols-1 gap-3 rounded-xl border p-3.5 sm:grid-cols-2">
                <div className="space-y-1.5">
                    <Label htmlFor="data-inicial" className="text-foreground text-xs font-medium">
                        Data Inicial {formData.recorrencia !== 'personalizado' && '(ajusta horários)'}
                    </Label>
                    <DatePicker
                        value={formData.data_inicial ? new Date(formData.data_inicial) : undefined}
                        onSelect={handleDataInicialChange}
                        disabled={(date) => date < hoje}
                        placeholder="Selecione a data de início"
                    />
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="data-final" className="text-foreground text-xs font-medium">
                        Data Término {formData.recorrencia !== 'personalizado' && '(calculado)'}
                    </Label>
                    <DatePicker
                        modal
                        value={formData.data_final ? new Date(formData.data_final) : undefined}
                        onSelect={(date) => {
                            setFormData('data_final', date);
                        }}
                        buttonDisabled={formData.recorrencia !== 'personalizado'}
                        disabled={(date) => (formData.data_inicial ? date < new Date(formData.data_inicial) : date < hoje)}
                        placeholder="Selecione a data de término"
                    />
                </div>
            </div>

            {/* Banner Informativo do Período Calculado */}
            <div className="bg-card border-border/70 flex items-start gap-2.5 rounded-xl border p-3 text-xs">
                <Info className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                <div className="flex-1 space-y-0.5">
                    <span className="text-foreground font-semibold">Vigência da Solicitação:</span>
                    <p className="text-muted-foreground">
                        De <span className="text-foreground font-medium">{periodoFormatado.inicio}</span> até{' '}
                        <span className="text-foreground font-medium">{periodoFormatado.fim}</span>.
                    </p>
                </div>
            </div>

            {showRecurrenceAlert && (
                <div className="bg-warning/10 border-warning/30 text-foreground flex items-start gap-2.5 rounded-xl border p-3 text-xs">
                    <Repeat className="text-warning mt-0.5 h-4 w-4 shrink-0" />
                    <p className="text-muted-foreground">
                        O período final foi calculado de acordo com a recorrência selecionada. Alterações na data de início deslocam os horários
                        proporcionalmente.
                    </p>
                </div>
            )}

            {/* Lista dos Horários Selecionados */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label className="text-foreground flex items-center gap-1.5 text-xs font-semibold">
                        <Calendar className="text-primary h-3.5 w-3.5" />
                        Horários Selecionados
                    </Label>
                    <Badge variant="secondary" className="text-[11px] font-medium">
                        {slotsSelecao.length} {slotsSelecao.length === 1 ? 'horário' : 'horários'}
                    </Badge>
                </div>

                <ScrollArea className="border-border/80 bg-card h-36 rounded-xl border p-3">
                    {Object.entries(slotsAgrupadosPorDia).length === 0 ? (
                        <div className="text-muted-foreground flex h-full items-center justify-center py-6 text-xs">Nenhum horário selecionado.</div>
                    ) : (
                        <div className="space-y-3">
                            {Object.entries(slotsAgrupadosPorDia).map(([diaKey, { data, slots }]) => (
                                <div key={diaKey} className="space-y-1.5">
                                    <span className="text-foreground flex items-center gap-1.5 text-xs font-semibold capitalize">
                                        <div className="bg-primary h-1.5 w-1.5 rounded-full" />
                                        {format(data, 'EEEE, dd/MM/yyyy', { locale: ptBR })}
                                    </span>
                                    <div className="flex flex-wrap gap-1.5 pl-3">
                                        {slots.map((slot) => (
                                            <Badge
                                                key={slot.id}
                                                variant="outline"
                                                className="bg-muted/40 border-border text-foreground px-2 py-0.5 font-mono text-[11px]"
                                            >
                                                {slot.horario_inicio.slice(0, 5)} - {slot.horario_fim.slice(0, 5)}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </div>
        </div>
    );
};

export default StepHorariosRecorrencia;
