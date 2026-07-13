import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getMensagemBloqueioRemocao, nivelParaLabel, podeRemoverAndar } from '@/lib/utils/andars/AndarHelpers';
import { AlertTriangle, Lock, Trash2 } from 'lucide-react';
export interface AndarFormData {
    id: string;
    nome: string;
    nivel: number; // -2, -1, 0, 1, 2, etc. (0 = térreo)
    tipo_acesso: string[];
}

interface AndarCardProps {
    andar: AndarFormData;
    index: number;
    onUpdate: (andarId: string, andar: AndarFormData) => void;
    onRemove: (andarId: string) => void;
    todosAndares: AndarFormData[];
    errors?: Record<string, string>;
}

const tiposDeAcesso = [
    { id: 'terreo', label: 'Acesso Térreo' },
    { id: 'escada', label: 'Escada' },
    { id: 'elevador', label: 'Elevador' },
    { id: 'rampa', label: 'Rampa' },
];

export default function AndarCard({ andar, index, onUpdate, onRemove, todosAndares, errors }: AndarCardProps) {
    const handleTipoAcessoChange = (tipoId: string, checked: boolean) => {
        const newTiposAcesso = checked ? [...andar.tipo_acesso, tipoId] : andar.tipo_acesso.filter((tipo) => tipo !== tipoId);

        onUpdate(andar.id, { ...andar, tipo_acesso: newTiposAcesso });
    };

    const podeRemover = podeRemoverAndar(andar, todosAndares);
    const mensagemBloqueio = getMensagemBloqueioRemocao(andar, todosAndares);
    const isTerreo = andar.nivel === 0;
    const hasErrors = errors?.[`andares.${index}.tipo_acesso`];

    // Função para lidar com tentativa de remoção
    const handleRemoveClick = () => {
        if (!podeRemover) {
            console.warn(`Tentativa de remoção bloqueada: ${mensagemBloqueio}`);
            return;
        }
        onRemove(andar.id);
    };

    // Determinar ícone do botão
    const getIconeBotao = () => {
        if (isTerreo) return <Lock className="h-4 w-4" />;
        if (!podeRemover) return <AlertTriangle className="h-4 w-4" />;
        return <Trash2 className="h-4 w-4" />;
    };

    // Determinar cor do botão
    const getCorBotao = () => {
        if (podeRemover) return 'text-red-600 hover:text-red-700';
        if (isTerreo) return 'text-blue-400 cursor-not-allowed border-blue-200';
        return 'text-amber-500 cursor-not-allowed border-amber-200';
    };

    return (
        <TooltipProvider>
            <Card className={`relative ${hasErrors ? 'border-red-200' : ''} ${isTerreo ? 'border-blue-200 bg-blue-50/50' : ''}`}>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            {nivelParaLabel(andar.nivel)}
                            {isTerreo && (
                                <div className="flex items-center gap-1">
                                    <Lock className="h-3 w-3 text-blue-600" />
                                    <span className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">Obrigatório</span>
                                </div>
                            )}
                        </CardTitle>

                        <div className="flex items-center gap-2">
                            {/* Badges dos tipos de acesso */}
                            {andar.tipo_acesso.length > 0 && (
                                <div className="flex gap-1">
                                    {andar.tipo_acesso.slice(0, 2).map((tipo) => (
                                        <span key={tipo} className="bg-secondary rounded px-2 py-1 text-xs">
                                            {tiposDeAcesso.find((t) => t.id === tipo)?.label}
                                        </span>
                                    ))}
                                    {andar.tipo_acesso.length > 2 && (
                                        <span className="text-muted-foreground text-xs">+{andar.tipo_acesso.length - 2}</span>
                                    )}
                                </div>
                            )}

                            {/* Botão de remover */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleRemoveClick}
                                            disabled={!podeRemover}
                                            className={`h-8 w-8 p-0 ${getCorBotao()}`}
                                        >
                                            {getIconeBotao()}
                                        </Button>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <div className="max-w-xs">{mensagemBloqueio}</div>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-3">
                    {/* Aviso para térreo */}
                    {isTerreo && (
                        <div className="rounded border border-blue-200 bg-blue-100 p-2 text-xs text-blue-700">
                            <p className="font-medium">ℹ️ Andar obrigatório</p>
                            <p>Todo módulo deve ter térreo. Configure os tipos de acesso necessários.</p>
                        </div>
                    )}

                    {/* Aviso para andares bloqueados */}
                    {!podeRemover && !isTerreo && (
                        <div className="rounded border border-amber-200 bg-amber-50 p-2 text-xs text-amber-700">
                            <p className="flex items-center gap-1 font-medium">
                                <AlertTriangle className="h-3 w-3" />
                                Remoção bloqueada
                            </p>
                            <p>{mensagemBloqueio}</p>
                        </div>
                    )}

                    {/* Tipos de Acesso */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium">Tipos de Acesso</Label>
                        <div className="grid grid-cols-1 gap-3">
                            {tiposDeAcesso.map((tipo) => (
                                <div key={tipo.id} className="flex items-center space-x-3">
                                    <Checkbox
                                        id={`${andar.id}-${tipo.id}`}
                                        checked={andar.tipo_acesso.includes(tipo.id)}
                                        onCheckedChange={(checked) => handleTipoAcessoChange(tipo.id, checked as boolean)}
                                    />
                                    <Label htmlFor={`${andar.id}-${tipo.id}`} className="flex-1 cursor-pointer text-sm font-normal">
                                        {tipo.label}
                                    </Label>
                                </div>
                            ))}
                        </div>
                        {hasErrors && <p className="text-xs text-red-500">{errors[`andares.${index}.tipo_acesso`]}</p>}
                    </div>
                </CardContent>
            </Card>
        </TooltipProvider>
    );
}
