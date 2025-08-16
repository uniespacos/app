import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { SituacaoReserva, SlotCalendario } from '@/types';
import { CheckCircle, XCircle } from 'lucide-react';

type EvaluationFormProps = {
    // State
    decisao: SituacaoReserva;
    motivo: string;
    observacao: string;
    isSubmitting: boolean;
    isRadioGroupDisabled: boolean;
    slotsSelecao: SlotCalendario[];

    // Handlers
    onDecisaoChange: (value: SituacaoReserva) => void;
    onMotivoChange: (value: string) => void;
    onObservacaoChange: (value: string) => void;
    onSubmit: (e: React.FormEvent) => void;
};

export default function EvaluationForm({
    decisao,
    motivo,
    observacao,
    isSubmitting,
    isRadioGroupDisabled,
    slotsSelecao,
    onDecisaoChange,
    onMotivoChange,
    onObservacaoChange,
    onSubmit,
}: EvaluationFormProps) {
    const showMotivoField = decisao === 'indeferida' || slotsSelecao.some((slot) => slot.status === 'indeferida');

    return (
        <form onSubmit={onSubmit}>
            <Card>
                <CardHeader>
                    <CardTitle>Avaliação da Reserva</CardTitle>
                    <CardDescription>Defina se a reserva será deferida ou indeferida</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label className="text-base font-medium">Decisão</Label>
                        <RadioGroup value={decisao} onValueChange={onDecisaoChange} disabled={isRadioGroupDisabled}>
                            <div className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-green-50">
                                <RadioGroupItem value="deferida" id="deferida" />
                                <Label htmlFor="deferida" className="flex cursor-pointer items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    Deferir Reserva
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-red-50">
                                <RadioGroupItem value="indeferida" id="indeferida" />
                                <Label htmlFor="indeferida" className="flex cursor-pointer items-center gap-2">
                                    <XCircle className="h-4 w-4 text-red-600" />
                                    Indeferir Reserva
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {showMotivoField && (
                        <div className="space-y-2">
                            <Label htmlFor="motivo" className="text-base font-medium text-red-700">
                                Motivo do Indeferimento *
                            </Label>
                            <Textarea
                                id="motivo"
                                placeholder="Descreva o motivo pelo qual a reserva está sendo indeferida..."
                                value={motivo}
                                onChange={(e) => onMotivoChange(e.target.value)}
                                className="min-h-[100px] border-red-200 focus:border-red-500"
                            />
                            <p className="text-sm text-red-600">Este campo é obrigatório para reservas indeferidas</p>
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="observacao" className="text-base font-medium text-blue-700">
                            Observação
                        </Label>
                        <Textarea
                            id="observacao"
                            placeholder="Caso haja uma observação adicional, descreva aqui..."
                            value={observacao}
                            onChange={(e) => onObservacaoChange(e.target.value)}
                            className="min-h-[100px] border-blue-200 focus:border-blue-500"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="submit"
                            disabled={!decisao || (decisao === 'indeferida' && !motivo.trim()) || isSubmitting}
                            className="flex-1"
                        >
                            {isSubmitting ? 'Processando...' : 'Confirmar Avaliação'}
                        </Button>
                        <Button type="button" variant="outline" className="px-8" onClick={() => window.history.back()}>
                            Cancelar
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}
