/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { OpcoesRecorrencia, ReservaFormData, SlotCalendario } from '@/types';
import { addDays, addMonths, format } from 'date-fns';
import { type Locale } from 'date-fns/locale';
import { Calendar, FileText, Info, Repeat, Type } from 'lucide-react';
import { FormEvent, useMemo } from 'react';

type AgendaDialogReservaProps = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (e: FormEvent) => void;
    slotsSelecao: SlotCalendario[];
    hoje: Date;
    isSubmitting: boolean;
    isEditMode?: boolean;
    formData: ReservaFormData;
    setFormData: (key: keyof ReservaFormData, value: any) => void;
    locale?: Locale;
};

export default function AgendaDialogReserva({
    isEditMode, isOpen, onOpenChange, onSubmit, slotsSelecao, hoje, isSubmitting,
    formData, setFormData, locale,
}: AgendaDialogReservaProps) {

    const opcoesRecorrencia: OpcoesRecorrencia[] = [
        { valor: 'unica', label: 'Apenas esta semana', descricao: 'A reserva será feita apenas para os dias selecionados nesta semana', calcularDataFinal: (dataInicial: Date) => addDays(dataInicial, 6) },
        { valor: '15dias', label: 'Próximos 15 dias', descricao: 'A reserva será replicada pelos próximos 15 dias', calcularDataFinal: (dataInicial: Date) => addDays(dataInicial, 14) },
        { valor: '1mes', label: '1 mês', descricao: 'A reserva será replicada por 1 mês', calcularDataFinal: (dataInicial: Date) => addMonths(dataInicial, 1) },
        { valor: 'personalizado', label: 'Período personalizado', descricao: 'Defina um período personalizado para a recorrência', calcularDataFinal: (dataInicial: Date) => dataInicial },
    ];

    const periodoRecorrencia = useMemo(() => ({
        inicio: format(formData.data_inicial ?? hoje, 'dd/MM/yyyy', { locale }),
        fim: format(formData.data_final ?? addMonths(hoje, 1), 'dd/MM/yyyy', { locale }),
    }), [formData.data_inicial, formData.data_final, hoje, locale]);

    const slotsAgrupadosPorDia = useMemo(() =>
        slotsSelecao.reduce(
            (acc, horario) => {
                const diaKey = format(horario.data, 'yyyy-MM-dd');
                if (!acc[diaKey]) { acc[diaKey] = { data: horario.data, slots: [] }; }
                acc[diaKey].slots.push(horario);
                return acc;
            }, {} as Record<string, { data: Date; slots: SlotCalendario[] }>
        ), [slotsSelecao]
    );

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button className="shadow-lg">
                    {isEditMode ? 'Atualizar' : 'Reservar'} {slotsSelecao.length} horário{slotsSelecao.length > 1 ? 's' : ''} em{' '}
                    {Object.keys(slotsAgrupadosPorDia).length} dia
                    {Object.keys(slotsAgrupadosPorDia).length > 1 ? 's' : ''}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] w-full overflow-y-auto">
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle>{isEditMode ? 'Atualizar Reserva' : 'Confirmar Reserva'}</DialogTitle>
                        <DialogDescription>{isEditMode ? 'Ajuste os detalhes e o escopo da sua alteração.' : 'Preencha os detalhes da sua reserva.'}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="titulo" className="flex items-center gap-2 font-medium"><Type className="text-muted-foreground h-4 w-4" /> Título da Reserva</Label>
                            <Input id="titulo" placeholder="Ex: Aula, Reunião" value={formData.titulo} onChange={(e) => setFormData('titulo', e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="descricao" className="flex items-center gap-2 font-medium"><FileText className="text-muted-foreground h-4 w-4" /> Descrição</Label>
                            <Textarea id="descricao" placeholder="Descreva o propósito da reserva..." value={formData.descricao} onChange={(e) => setFormData('descricao', e.target.value)} className="min-h-[80px] resize-none" />
                        </div>

                        {isEditMode && (
                            <div className="space-y-2 border-t pt-4">
                                <h3 className="flex items-center gap-2 font-medium">Aplicar Alterações Para:</h3>
                                <RadioGroup value={formData.edit_scope} onValueChange={(v) => setFormData('edit_scope', v)} className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="recurring" id="edit-scope-recurring" />
                                        <Label htmlFor="edit-scope-recurring" className="cursor-pointer">Toda a recorrência (Ex: remover/adicionar esta 3ª feira em todas as semanas)</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="single" id="edit-scope-single" />
                                        <Label htmlFor="edit-scope-single" className="cursor-pointer">Apenas os horários desta semana</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        )}

                        <div className="space-y-2 border-t pt-2">
                            <h3 className="flex items-center gap-2 font-medium"><Repeat className="text-muted-foreground h-4 w-4" /> Período de Recorrência</h3>
                            <RadioGroup value={formData.recorrencia} onValueChange={(v) => setFormData('recorrencia', v)} className="space-y-2">
                                {opcoesRecorrencia.map((opcao) => (
                                    <div key={opcao.valor} className="flex items-start space-x-2">
                                        <RadioGroupItem value={opcao.valor} id={opcao.valor} />
                                        <div className="grid gap-1">
                                            <Label htmlFor={opcao.valor} className="font-medium">{opcao.label}</Label>
                                            <p className="text-muted-foreground text-xs">{opcao.descricao}</p>
                                        </div>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>

                        {formData.recorrencia === 'personalizado' && (
                            <div className="bg-muted/10 grid grid-cols-2 gap-4 rounded-md border p-3">
                                <div className="space-y-2">
                                    <Label htmlFor="data-inicial" className="text-xs">Início</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant={'outline'} className={cn('w-full justify-start text-left font-normal', !formData.data_inicial && 'text-muted-foreground')}>
                                                <Calendar className="mr-2 h-4 w-4" />
                                                {formData.data_inicial ? format(new Date(formData.data_inicial), 'dd/MM/yyyy') : <span>Selecione</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <CalendarComponent locale={locale} mode="single" selected={formData.data_inicial ? new Date(formData.data_inicial) : undefined} onSelect={(date) => setFormData('data_inicial', date)} initialFocus disabled={(date) => date < hoje} />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="data-final" className="text-xs">Término</Label>
                                    <Popover modal>
                                        <PopoverTrigger asChild>
                                            <Button variant={'outline'} className={cn('w-full justify-start text-left font-normal', !formData.data_final && 'text-muted-foreground')}>
                                                <Calendar className="mr-2 h-4 w-4" />
                                                {formData.data_final ? format(new Date(formData.data_final), 'dd/MM/yyyy') : <span>Selecione</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <CalendarComponent locale={locale} mode="single" selected={formData.data_final ? new Date(formData.data_final) : undefined} onSelect={(date) => setFormData('data_final', date)} initialFocus disabled={(date) => (formData.data_inicial ? date < new Date(formData.data_inicial) : date < hoje)} />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                        )}

                        <div className="bg-muted/30 flex items-start gap-2 rounded-md p-3">
                            <Info className="text-muted-foreground mt-0.5 h-4 w-4 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium">Período da reserva</p>
                                <p className="text-muted-foreground text-xs">De {periodoRecorrencia.inicio} até {periodoRecorrencia.fim}</p>
                            </div>
                        </div>
                        <div className="space-y-2 border-t pt-2">
                            <h3 className="flex items-center gap-2 font-medium"><Calendar className="text-muted-foreground h-4 w-4" /> Horários selecionados</h3>
                            <ScrollArea className="h-[150px] rounded-md border p-2">
                                {Object.entries(slotsAgrupadosPorDia).map(([diaKey, { data, slots }]) => (
                                    <div key={diaKey} className="mb-3 last:mb-0">
                                        <div className="mb-1 text-sm font-medium">{format(data, 'EEEE')}</div>
                                        <div>
                                            {slots.map((horario) => (
                                                <div key={horario.id} className="text-muted-foreground py-1 text-sm">{horario.horario_inicio.substring(0, 5)} - {horario.horario_fim.substring(0, 5)}</div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </ScrollArea>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                        <Button type="submit" disabled={!formData.titulo.trim() || isSubmitting}>
                            {isSubmitting ? (isEditMode ? 'Salvando...' : 'Enviando...') : (isEditMode ? 'Atualizar Reserva' : 'Confirmar Reserva')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}