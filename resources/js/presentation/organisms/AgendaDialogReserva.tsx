/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { opcoesRecorrencia } from '@/constants/recorrencia';
import { cn } from '@/lib/utils';
import { DatePicker } from '@/presentation/molecules/DatePicker';
import { Modal } from '@/presentation/molecules/Modal';
import { Espaco, ReservaFormData, SlotCalendario } from '@/types';
import { addMonths, addWeeks, format, isBefore, parseISO, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AlertCircle, Calendar, FileText, Info, Repeat, Type } from 'lucide-react';
import { SyntheticEvent, useCallback, useEffect, useMemo, useState } from 'react';

interface AgendaDialogReservaProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (e: SyntheticEvent) => void;
    slotsSelecao: SlotCalendario[];
    hoje: Date;
    isSubmitting: boolean;
    isEditMode?: boolean;
    espaco: Espaco;
    formData: ReservaFormData;
    setFormData: (key: keyof ReservaFormData, value: any) => void;
    setSlotsSelecao?: (slots: SlotCalendario[]) => void;
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
                'flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors',
                selecionado ? 'border-primary bg-primary/5' : 'hover:bg-muted/50 border-border',
            )}
        >
            <RadioGroupItem value={value} id={id} className="mt-0.5" />
            <div className="grid gap-0.5">
                <span className="text-sm font-medium">{titulo}</span>
                {descricao && <span className="text-muted-foreground text-xs">{descricao}</span>}
            </div>
        </Label>
    );
}

export default function AgendaDialogReserva({
    isEditMode,
    isOpen,
    onOpenChange,
    onSubmit,
    slotsSelecao,
    hoje,
    isSubmitting,
    espaco,
    formData,
    setFormData,
    setSlotsSelecao,
}: AgendaDialogReservaProps) {
    const [showRecurrenceAlert, setShowRecurrenceAlert] = useState(false);
    const [datasComConflito, setDatasComConflito] = useState<string[]>([]);

    const verificarConflitos = useCallback(
        (horarios: any[]) => {
            const conflitos: string[] = [];
            horarios.forEach((hSol) => {
                const dataSol = hSol.data;
                espaco.agendas?.forEach((agenda) => {
                    if (agenda.id === hSol.agenda_id) {
                        agenda.horarios?.forEach((hExist) => {
                            if (
                                hExist.data === dataSol &&
                                hExist.situacao === 'deferida' &&
                                hExist.horario_inicio < hSol.horario_fim &&
                                hExist.horario_fim > hSol.horario_inicio
                            ) {
                                const dataFormatada = format(parseISO(dataSol), 'dd/MM/yyyy');
                                if (!conflitos.includes(dataFormatada)) {
                                    conflitos.push(dataFormatada);
                                }
                            }
                        });
                    }
                });
            });
            setDatasComConflito(conflitos);
        },
        [espaco.agendas],
    );

    const handleSubmit = useCallback(
        (e: SyntheticEvent) => {
            onSubmit(e);
        },
        [onSubmit],
    );

    const handleSetFormData = useCallback(
        (key: keyof ReservaFormData, value: any) => {
            if (key === 'data_inicial') {
                const newDate = value instanceof Date ? value : new Date(value);
                const oldDate = formData.data_inicial ? new Date(formData.data_inicial) : null;

                if (oldDate && !isNaN(newDate.getTime()) && !isNaN(oldDate.getTime())) {
                    const diffTime = newDate.getTime() - oldDate.getTime();
                    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

                    if (diffDays !== 0) {
                        const newHorarios = formData.horarios_solicitados.map((h: any) => {
                            const d = new Date(h.data + 'T00:00:00');
                            d.setDate(d.getDate() + diffDays);
                            return { ...h, data: format(d, 'yyyy-MM-dd') };
                        });
                        setFormData('horarios_solicitados', newHorarios);
                        verificarConflitos(newHorarios);

                        if (setSlotsSelecao) {
                            const newSlots = slotsSelecao.map((s) => {
                                const d = new Date(s.data);
                                d.setDate(d.getDate() + diffDays);
                                return { ...s, data: d, id: `${format(d, 'yyyy-MM-dd')}|${s.horario_inicio}` };
                            });
                            setSlotsSelecao(newSlots);
                        }

                        if (formData.recorrencia !== 'personalizado') {
                            const option = opcoesRecorrencia.find((o) => o.valor === formData.recorrencia);
                            if (option) {
                                setFormData('data_final', option.calcularDataFinal(newDate));
                            }
                        }
                        setShowRecurrenceAlert(true);
                    }
                }
            } else if (key === 'recorrencia') {
                setShowRecurrenceAlert(value !== 'unica');
            } else if (key === 'horarios_solicitados') {
                verificarConflitos(value);
            }

            setFormData(key, value);
        },
        [formData.data_inicial, formData.horarios_solicitados, formData.recorrencia, setFormData, setSlotsSelecao, slotsSelecao, verificarConflitos],
    );

    useEffect(() => {
        if (isOpen) {
            if (formData.recorrencia !== 'unica') {
                setShowRecurrenceAlert(true);
            }

            const dataInicial = formData.data_inicial ? new Date(formData.data_inicial) : null;
            if (dataInicial && isBefore(startOfDay(dataInicial), startOfDay(hoje))) {
                const sugerida = addWeeks(dataInicial, 1);
                handleSetFormData('data_inicial', sugerida);
            } else {
                verificarConflitos(formData.horarios_solicitados);
            }
        }
    }, [isOpen, formData.recorrencia, formData.data_inicial, formData.horarios_solicitados, hoje, handleSetFormData, verificarConflitos]);

    const periodoRecorrencia = useMemo(
        () => ({
            inicio: format(formData.data_inicial ?? hoje, 'dd/MM/yyyy'),
            fim: format(formData.data_final ?? addMonths(hoje, 1), 'dd/MM/yyyy'),
        }),
        [formData.data_inicial, formData.data_final, hoje],
    );

    const slotsAgrupadosPorDia = useMemo(
        () =>
            slotsSelecao.reduce<Record<string, { data: Date; slots: SlotCalendario[] }>>((acc, horario) => {
                const diaKey = format(horario.data, 'yyyy-MM-dd');
                if (!acc[diaKey]) {
                    acc[diaKey] = { data: horario.data, slots: [] };
                }
                acc[diaKey].slots.push(horario);
                return acc;
            }, {}),
        [slotsSelecao],
    );

    return (
        <Modal
            open={isOpen}
            onOpenChange={onOpenChange}
            size="lg"
            className="max-h-[90vh] w-[calc(100%-2rem)] overflow-y-auto sm:w-full"
            title={
                <span className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {isEditMode ? 'Atualizar Reserva' : 'Confirmar Reserva'}
                </span>
            }
            description={isEditMode ? 'Ajuste os detalhes e o escopo da sua alteração.' : 'Preencha os detalhes da sua reserva.'}
            trigger={
                <Button className="w-full whitespace-normal sm:w-auto">
                    {isEditMode ? 'Atualizar' : 'Reservar'} {slotsSelecao.length} horário{slotsSelecao.length > 1 ? 's' : ''} em{' '}
                    {Object.keys(slotsAgrupadosPorDia).length} dia
                    {Object.keys(slotsAgrupadosPorDia).length > 1 ? 's' : ''}
                </Button>
            }
        >
            <form onSubmit={handleSubmit}>
                <div className="space-y-5 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="titulo" className="flex items-center gap-1.5 font-medium">
                            <Type className="text-muted-foreground h-4 w-4" />
                            Título da Reserva
                            <span className="text-destructive-accent bg-destructive-subtle rounded-full px-2 py-0.5 text-xs font-normal">
                                Obrigatório
                            </span>
                        </Label>
                        <Input
                            id="titulo"
                            placeholder="Ex: Aula, Reunião"
                            value={formData.titulo}
                            onChange={(e) => {
                                handleSetFormData('titulo', e.target.value);
                            }}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="descricao" className="flex items-center gap-1.5 font-medium">
                            <FileText className="text-muted-foreground h-4 w-4" />
                            Descrição
                            <span className="text-destructive-accent bg-destructive-subtle rounded-full px-2 py-0.5 text-xs font-normal">
                                Obrigatório
                            </span>
                        </Label>
                        <Textarea
                            id="descricao"
                            placeholder="Descreva o propósito da reserva..."
                            value={formData.descricao}
                            onChange={(e) => {
                                handleSetFormData('descricao', e.target.value);
                            }}
                            className="min-h-[80px] resize-none"
                        />
                    </div>

                    {isEditMode && (
                        <div className="space-y-2 border-t pt-4">
                            <h3 className="text-sm font-medium">Aplicar Alterações Para</h3>
                            <RadioGroup
                                value={formData.edit_scope}
                                onValueChange={(v) => {
                                    handleSetFormData('edit_scope', v);
                                }}
                                className="space-y-2"
                            >
                                <OpcaoRadioCard
                                    value="recurring"
                                    id="edit-scope-recurring"
                                    titulo="Toda a recorrência"
                                    descricao="Ex: remover/adicionar esta 3ª feira em todas as semanas"
                                    selecionado={formData.edit_scope === 'recurring'}
                                />
                                <OpcaoRadioCard
                                    value="single"
                                    id="edit-scope-single"
                                    titulo="Apenas os horários desta semana"
                                    selecionado={formData.edit_scope === 'single'}
                                />
                            </RadioGroup>
                        </div>
                    )}

                    <div className="space-y-2 border-t pt-4">
                        <h3 className="flex items-center gap-1.5 text-sm font-medium">
                            <Repeat className="text-muted-foreground h-4 w-4" />
                            Período de Recorrência
                        </h3>
                        <RadioGroup
                            value={formData.recorrencia}
                            onValueChange={(v) => {
                                handleSetFormData('recorrencia', v);
                            }}
                            className="space-y-2"
                        >
                            {opcoesRecorrencia.map((opcao) => (
                                <OpcaoRadioCard
                                    key={opcao.valor}
                                    value={opcao.valor}
                                    id={opcao.valor}
                                    titulo={opcao.label}
                                    descricao={opcao.descricao}
                                    selecionado={formData.recorrencia === opcao.valor}
                                />
                            ))}
                        </RadioGroup>
                    </div>

                    <div className="bg-muted/30 grid grid-cols-1 gap-4 rounded-lg border p-3 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="data-inicial" className="text-xs">
                                Início {formData.recorrencia !== 'personalizado' && '(ajusta recorrência)'}
                            </Label>
                            <DatePicker
                                value={formData.data_inicial ? new Date(formData.data_inicial) : undefined}
                                onSelect={(date) => {
                                    handleSetFormData('data_inicial', date);
                                }}
                                disabled={(date) => date < hoje}
                                placeholder="Selecione"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="data-final" className="text-xs">
                                Término {formData.recorrencia !== 'personalizado' && '(calculado)'}
                            </Label>
                            <DatePicker
                                modal
                                value={formData.data_final ? new Date(formData.data_final) : undefined}
                                onSelect={(date) => {
                                    handleSetFormData('data_final', date);
                                }}
                                buttonDisabled={formData.recorrencia !== 'personalizado'}
                                disabled={(date) => (formData.data_inicial ? date < new Date(formData.data_inicial) : date < hoje)}
                                placeholder="Selecione"
                            />
                        </div>
                    </div>

                    <div className="bg-muted/30 flex items-start gap-2 rounded-lg p-3">
                        <Info className="text-muted-foreground mt-0.5 h-4 w-4 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-medium">Período da reserva</p>
                            <p className="text-muted-foreground text-xs">
                                De {periodoRecorrencia.inicio} até {periodoRecorrencia.fim}
                            </p>
                        </div>
                    </div>
                    <div className="space-y-2 border-t pt-4">
                        <h3 className="flex items-center gap-1.5 text-sm font-medium">
                            <Calendar className="text-muted-foreground h-4 w-4" />
                            Horários selecionados
                            <span className="text-muted-foreground font-normal">({slotsSelecao.length})</span>
                        </h3>
                        <ScrollArea className="h-[150px] rounded-lg border p-2">
                            {Object.entries(slotsAgrupadosPorDia).map(([diaKey, { data, slots }]) => (
                                <div key={diaKey} className="mb-3 last:mb-0">
                                    <div className="mb-1 text-sm font-medium">{format(data, 'EEEE', { locale: ptBR })}</div>
                                    <div>
                                        {slots.map((horario) => (
                                            <div key={horario.id} className="text-muted-foreground py-1 text-sm">
                                                {horario.horario_inicio.substring(0, 5)} - {horario.horario_fim.substring(0, 5)}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </ScrollArea>
                    </div>
                </div>
                {datasComConflito.length > 0 && (
                    <div className="bg-destructive-subtle border-destructive text-destructive-accent mt-4 rounded-lg border-l-4 p-4" role="alert">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            <p className="text-sm font-semibold">Conflito de Horários Detectado</p>
                        </div>
                        <p className="mt-1 text-xs opacity-90">
                            Já existem reservas confirmadas para as seguintes datas: <strong>{datasComConflito.join(', ')}</strong>. Por favor, altere
                            os horários ou as datas para evitar conflitos, ou saiba que estes dias podem ser indeferidos.
                        </p>
                    </div>
                )}

                {showRecurrenceAlert && (
                    <div className="border-warning bg-warning-subtle text-warning-accent mt-4 rounded-lg border-l-4 p-4" role="alert">
                        <div className="flex items-center gap-2">
                            <Repeat className="text-warning-accent h-4 w-4" />
                            <p className="text-sm font-semibold">Ajuste de Recorrência</p>
                        </div>
                        <p className="mt-1 text-xs opacity-90">
                            O período final e os horários foram ajustados automaticamente para seguir o padrão de recorrência selecionado. Ao alterar
                            a data de início, todos os horários selecionados serão deslocados proporcionalmente.
                        </p>
                    </div>
                )}
                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            onOpenChange(false);
                        }}
                    >
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={!formData.titulo.trim() || !formData.descricao.trim() || isSubmitting}>
                        {isSubmitting ? (isEditMode ? 'Salvando...' : 'Enviando...') : isEditMode ? 'Atualizar Reserva' : 'Confirmar Reserva'}
                    </Button>
                </DialogFooter>
            </form>
        </Modal>
    );
}
