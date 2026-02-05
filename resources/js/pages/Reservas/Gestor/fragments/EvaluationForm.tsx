/* eslint-disable @typescript-eslint/no-explicit-any */
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { SituacaoReserva, SlotCalendario } from '@/types';
import { router } from '@inertiajs/react';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

// Define o tipo para o objeto 'data' que vem do useForm
type FormData = {
    situacao: SituacaoReserva;
    motivo: string;
    observacao: string;
    evaluation_scope: 'single' | 'recurring';
};

// Define as props que o componente espera receber
type EvaluationFormProps = {
    data: FormData;
    setData: (field: keyof FormData, value: any) => void; // Função para alterar os dados do formulário

    decisao: SituacaoReserva;
    isSubmitting: boolean;
    isRadioGroupDisabled: boolean;
    slotsSelecao: SlotCalendario[];
    isReavaliacao: boolean; // <-- RECEBA A NOVA PROP
    onDecisaoChange: (value: SituacaoReserva) => void;
    onSubmit: (e: React.FormEvent) => void;
};

export default function EvaluationForm({
    data,
    setData,
    decisao,
    isSubmitting,
    isRadioGroupDisabled,
    slotsSelecao,
    onDecisaoChange,
    onSubmit,
    isReavaliacao
}: EvaluationFormProps) {
    const showMotivoField = decisao === 'indeferida' || slotsSelecao.some((slot) => slot.status === 'indeferida');

    return (
        <form onSubmit={onSubmit}>
            <Card>
                <CardHeader>
                    <CardTitle>Avaliação da Reserva</CardTitle>
                    <CardDescription>Defina se a reserva será deferida ou indeferida e adicione suas observações.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {isReavaliacao && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Atenção: Reavaliação de Reserva</AlertTitle>
                            <AlertDescription>
                                Esta reserva já possui horários avaliados. Suas novas decisões podem
                                sobrescrever avaliações anteriores. Se aplicar para "Toda a recorrência",
                                a avaliação será replicada para todos os horários correspondentes no período.
                            </AlertDescription>
                        </Alert>
                    )}
                    <div className="space-y-2">
                        <Label className="font-medium">Aplicar esta avaliação para:</Label>
                        <RadioGroup
                            value={data.evaluation_scope}
                            onValueChange={(value: 'single' | 'recurring') => setData('evaluation_scope', value)}
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
                            <div className="flex items-center space-x-2 rounded-lg border p-3 has-[:checked]:bg-green-50 has-[:checked]:border-green-300">
                                <RadioGroupItem value="deferida" id="deferida" />
                                <Label htmlFor="deferida" className="flex w-full cursor-pointer items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    Deferir todos os horários visíveis
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2 rounded-lg border p-3 has-[:checked]:bg-red-50 has-[:checked]:border-red-300">
                                <RadioGroupItem value="indeferida" id="indeferida" />
                                <Label htmlFor="indeferida" className="flex w-full cursor-pointer items-center gap-2">
                                    <XCircle className="h-4 w-4 text-red-600" />
                                    Indeferir todos os horários visíveis
                                </Label>
                            </div>
                        </RadioGroup>
                        {isRadioGroupDisabled && <p className="text-xs text-muted-foreground">Para avaliação global, todos os horários devem ter a mesma decisão.</p>}
                    </div>

                    {showMotivoField && (
                        <div className="space-y-2">
                            <Label htmlFor="motivo" className="font-medium text-red-700">
                                Motivo do Indeferimento *
                            </Label>
                            <Textarea
                                id="motivo"
                                placeholder="Descreva o motivo pelo qual um ou mais horários estão sendo indeferidos..."
                                value={data.motivo}
                                onChange={(e) => setData('motivo', e.target.value)}
                                className="min-h-[100px] border-red-200 focus:border-red-500"
                            />
                            <p className="text-sm text-red-600">Este campo é obrigatório se algum horário for indeferido.</p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="observacao" className="font-medium text-blue-700">
                            Observação (Opcional)
                        </Label>
                        <Textarea
                            id="observacao"
                            placeholder="Caso haja uma observação adicional para o solicitante, descreva aqui..."
                            value={data.observacao}
                            onChange={(e) => setData('observacao', e.target.value)}
                            className="min-h-[100px] border-blue-200 focus:border-blue-500"
                        />
                    </div>

                    <div className="flex gap-3 border-t pt-4">
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1"
                        >
                            {isSubmitting ? 'Processando...' : 'Confirmar Avaliação'}
                        </Button>
                        <Button type="button" variant="outline" className="px-8" onClick={() => router.get(route('gestor.reservas.index'))}>
                            Cancelar
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}