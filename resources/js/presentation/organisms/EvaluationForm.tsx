import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/presentation/molecules/FormField';
import { SituacaoReserva, SlotCalendario } from '@/types';
import { router } from '@inertiajs/react';
import { CheckCircle, Info, XCircle } from 'lucide-react';
import type React from 'react';

interface FormData {
    situacao: SituacaoReserva;
    motivo: string;
    observacao: string;
    evaluation_scope: 'single' | 'recurring';
}

interface EvaluationFormProps {
    data: FormData;
    setData: (field: keyof FormData, value: unknown) => void;
    decisao: SituacaoReserva;
    isSubmitting: boolean;
    isRadioGroupDisabled: boolean;
    slotsSelecao: SlotCalendario[];
    isReavaliacao: boolean;
    onDecisaoChange: (value: SituacaoReserva) => void;
    onSubmit: (e: React.SyntheticEvent) => void;
}

export default function EvaluationForm({
    data,
    setData,
    decisao,
    isSubmitting,
    isRadioGroupDisabled,
    slotsSelecao,
    onDecisaoChange,
    onSubmit,
    isReavaliacao,
}: EvaluationFormProps) {
    const showMotivoField =
        decisao === 'indeferida' || slotsSelecao.some((slot) => slot.status === 'indeferida') || (isReavaliacao && Boolean(data.motivo));

    return (
        <form onSubmit={onSubmit}>
            <Card>
                <CardHeader>
                    <CardTitle>{isReavaliacao ? 'Reavaliação da Reserva' : 'Avaliação da Reserva'}</CardTitle>
                    <CardDescription>
                        {isReavaliacao
                            ? 'Revise e altere as decisões dos horários e atualize as observações da reserva.'
                            : 'Defina se a reserva será deferida ou indeferida e adicione suas observações.'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {isReavaliacao && (
                        <Alert className="border-info/30 bg-info-subtle text-info-accent">
                            <Info className="text-info-accent h-4 w-4" />
                            <AlertTitle className="text-info-accent font-semibold">Reavaliação de Reserva</AlertTitle>
                            <AlertDescription className="text-info-accent/90 text-sm">
                                Esta reserva já foi avaliada anteriormente. Você está realizando uma reavaliação. Os dados e justificativas anteriores
                                foram pré-carregados nos campos abaixo. Suas novas decisões atualizarão os horários e o status geral da solicitação.
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-2">
                        <Label className="font-medium">Aplicar esta avaliação para:</Label>
                        <RadioGroup
                            value={data.evaluation_scope}
                            onValueChange={(value: 'single' | 'recurring') => {
                                setData('evaluation_scope', value);
                            }}
                            className="space-y-2"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="recurring" id="scope-recurring" />
                                <Label htmlFor="scope-recurring" className="cursor-pointer">
                                    Todos os horários recorrentes (Ex: todas as Segundas-feiras às 7:30)
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="single" id="scope-single" />
                                <Label htmlFor="scope-single" className="cursor-pointer">
                                    Apenas os horários modificados nesta semana
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="space-y-2">
                        <Label className="font-medium">Decisão Global</Label>
                        <RadioGroup value={decisao} onValueChange={onDecisaoChange} disabled={isRadioGroupDisabled}>
                            <div className="has-[:checked]:border-success/25 has-[:checked]:bg-success-subtle flex items-center space-x-2 rounded-lg border p-3">
                                <RadioGroupItem value="deferida" id="deferida" />
                                <Label htmlFor="deferida" className="flex w-full cursor-pointer items-center gap-2">
                                    <CheckCircle className="text-success-accent h-4 w-4" />
                                    Deferir todos os horários visíveis
                                </Label>
                            </div>
                            <div className="has-[:checked]:border-destructive/25 has-[:checked]:bg-destructive-subtle flex items-center space-x-2 rounded-lg border p-3">
                                <RadioGroupItem value="indeferida" id="indeferida" />
                                <Label htmlFor="indeferida" className="flex w-full cursor-pointer items-center gap-2">
                                    <XCircle className="text-destructive h-4 w-4" />
                                    Indeferir todos os horários visíveis
                                </Label>
                            </div>
                        </RadioGroup>
                        {isRadioGroupDisabled && (
                            <p className="text-muted-foreground text-xs">Para avaliação global, todos os horários devem ter a mesma decisão.</p>
                        )}
                    </div>

                    {showMotivoField && (
                        <FormField label="Motivo do Indeferimento" htmlFor="motivo" required>
                            <Textarea
                                id="motivo"
                                placeholder="Descreva o motivo pelo qual um ou mais horários estão sendo indeferidos..."
                                value={data.motivo}
                                onChange={(e) => {
                                    setData('motivo', e.target.value);
                                }}
                                className="border-destructive/25 focus:border-destructive min-h-[100px]"
                            />
                            <p className="text-destructive text-sm">Este campo é obrigatório se algum horário for indeferido.</p>
                        </FormField>
                    )}

                    <FormField label="Observação (Opcional)" htmlFor="observacao">
                        <Textarea
                            id="observacao"
                            placeholder="Caso haja uma observação adicional para o solicitante, descreva aqui..."
                            value={data.observacao}
                            onChange={(e) => {
                                setData('observacao', e.target.value);
                            }}
                            className="border-info/25 focus:border-info/25 min-h-[100px]"
                        />
                    </FormField>

                    <div className="flex gap-3 border-t pt-4">
                        <Button type="submit" disabled={isSubmitting} className="flex-1">
                            {isSubmitting
                                ? isReavaliacao
                                    ? 'Reavaliando...'
                                    : 'Processando...'
                                : isReavaliacao
                                  ? 'Reavaliar Reserva'
                                  : 'Confirmar Avaliação'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="px-8"
                            onClick={() => {
                                router.get(route('gestor.reservas.index'));
                            }}
                        >
                            Cancelar
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}
