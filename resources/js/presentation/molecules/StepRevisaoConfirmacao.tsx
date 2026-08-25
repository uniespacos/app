import React, { useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Building2, Calendar, FileText, CheckCircle2, Sparkles, Users } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Espaco, SlotCalendario } from '@/types';
import { ReservaFormData } from '@/types/reserva-stepper';
import { opcoesRecorrencia } from '@/constants/recorrencia';

export interface StepRevisaoConfirmacaoProps {
    espaco: Espaco;
    formData: ReservaFormData;
    setFormData: (key: keyof ReservaFormData, value: unknown) => void;
    slotsSelecao: SlotCalendario[];
    isEditMode?: boolean;
}

export const StepRevisaoConfirmacao: React.FC<StepRevisaoConfirmacaoProps> = ({
    espaco,
    formData,
    setFormData,
    slotsSelecao,
    isEditMode = false,
}) => {
    const rotuloRecorrencia = useMemo(() => {
        const op = opcoesRecorrencia.find((o) => o.valor === formData.recorrencia);
        return op?.label ?? formData.recorrencia;
    }, [formData.recorrencia]);

    const periodoFormatado = useMemo(() => {
        const dataIni = formData.data_inicial
            ? formData.data_inicial instanceof Date
                ? formData.data_inicial
                : parseISO(String(formData.data_inicial))
            : null;
        const dataFim = formData.data_final
            ? formData.data_final instanceof Date
                ? formData.data_final
                : parseISO(String(formData.data_final))
            : null;

        return {
            inicio: dataIni ? format(dataIni, 'dd/MM/yyyy', { locale: ptBR }) : 'N/I',
            fim: dataFim ? format(dataFim, 'dd/MM/yyyy', { locale: ptBR }) : 'N/I',
        };
    }, [formData.data_inicial, formData.data_final]);

    return (
        <div className="space-y-4">
            {/* Cabeçalho de Status / Modo */}
            <div className="bg-primary/10 border-primary/20 flex items-center gap-2.5 rounded-xl border p-3 text-xs">
                <Sparkles className="text-primary h-4 w-4 shrink-0" />
                <span className="text-foreground">
                    {isEditMode
                        ? 'Revise cuidadosamente as alterações solicitadas antes de salvar.'
                        : 'Revise os dados abaixo antes de submeter a solicitação de reserva.'}
                </span>
            </div>

            {/* Resumo do Espaço e Período em Grid */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* Cartão do Espaço */}
                <div className="bg-card border-border/80 space-y-2 rounded-xl border p-3.5 shadow-xs">
                    <div className="text-foreground flex items-center gap-2 text-xs font-semibold">
                        <Building2 className="text-primary h-4 w-4" />
                        Espaço Selecionado
                    </div>
                    <div className="space-y-0.5 pl-6">
                        <p className="text-foreground text-sm font-semibold">{espaco.nome}</p>
                        <p className="text-muted-foreground text-xs">
                            Capacidade: {espaco.capacidade_pessoas ? `${String(espaco.capacidade_pessoas)} pessoas` : 'Não informada'}
                        </p>
                    </div>
                </div>

                {/* Cartão de Datas & Recorrência */}
                <div className="bg-card border-border/80 space-y-2 rounded-xl border p-3.5 shadow-xs">
                    <div className="text-foreground flex items-center gap-2 text-xs font-semibold">
                        <Calendar className="text-primary h-4 w-4" />
                        Período & Recorrência
                    </div>
                    <div className="space-y-0.5 pl-6">
                        <p className="text-foreground text-xs font-medium">{rotuloRecorrencia}</p>
                        <p className="text-muted-foreground text-[11px]">
                            {periodoFormatado.inicio} até {periodoFormatado.fim} ({String(slotsSelecao.length)} slots/semana)
                        </p>
                    </div>
                </div>
            </div>

            {/* Resumo dos Dados do Evento */}
            <div className="bg-card border-border/80 space-y-2 rounded-xl border p-3.5 shadow-xs">
                <div className="flex items-center justify-between">
                    <div className="text-foreground flex items-center gap-2 text-xs font-semibold">
                        <FileText className="text-primary h-4 w-4" />
                        Dados da Atividade
                    </div>
                    {formData.publico_estimado ? (
                        <Badge variant="secondary" className="gap-1 text-[10px]">
                            <Users className="h-3 w-3" />
                            {formData.publico_estimado} pessoas
                        </Badge>
                    ) : null}
                </div>
                <div className="space-y-1 pl-6">
                    <p className="text-foreground text-xs font-semibold">{formData.titulo || 'Sem título informado'}</p>
                    <p className="text-muted-foreground line-clamp-3 text-xs leading-relaxed whitespace-pre-wrap">
                        {formData.descricao || 'Sem justificativa informada'}
                    </p>
                </div>
            </div>

            {/* Resumo dos Horários Selecionados */}
            <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                    <span className="text-foreground flex items-center gap-1.5 text-xs font-semibold">
                        <CheckCircle2 className="text-primary h-3.5 w-3.5" />
                        Horários da Reserva
                    </span>
                    <span className="text-muted-foreground text-[11px]">{slotsSelecao.length} selecionados</span>
                </div>
                <ScrollArea className="border-border/80 bg-card h-24 rounded-xl border p-2.5">
                    <div className="flex flex-wrap gap-1.5">
                        {slotsSelecao.map((slot) => {
                            const dataObj = slot.data instanceof Date ? slot.data : parseISO(String(slot.data));
                            return (
                                <Badge
                                    key={slot.id}
                                    variant="outline"
                                    className="bg-muted/40 border-border text-foreground px-2 py-0.5 font-mono text-[11px]"
                                >
                                    {format(dataObj, 'dd/MM', { locale: ptBR })} • {slot.horario_inicio.slice(0, 5)}-{slot.horario_fim.slice(0, 5)}
                                </Badge>
                            );
                        })}
                    </div>
                </ScrollArea>
            </div>

            {/* Termo de Responsabilidade Institucional */}
            <div className="bg-muted/30 border-border/80 space-y-2 rounded-xl border p-3.5">
                <div className="flex items-start gap-3">
                    <Checkbox
                        id="termo_responsabilidade"
                        checked={Boolean(formData.termo_responsabilidade)}
                        onCheckedChange={(checked) => {
                            setFormData('termo_responsabilidade', Boolean(checked));
                        }}
                        className="mt-0.5"
                    />
                    <div className="grid gap-1">
                        <Label htmlFor="termo_responsabilidade" className="text-foreground cursor-pointer text-xs leading-none font-semibold">
                            Termo de Compromisso e Responsabilidade
                        </Label>
                        <p className="text-muted-foreground text-[11px] leading-relaxed">
                            Declaro que estou ciente das normas de utilização dos espaços físicos da UESB e me comprometo com o zelo, guarda
                            patrimonial e conservação do local durante o período reservado.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StepRevisaoConfirmacao;
