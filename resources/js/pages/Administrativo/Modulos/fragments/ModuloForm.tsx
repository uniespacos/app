/* eslint-disable react-hooks/exhaustive-deps */
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SelectContent, SelectItem, SelectTrigger, Select as SelectUI, SelectValue } from '@/components/ui/select';
import { criarTerreoInicial, garantirTerreo, nivelParaNome } from '@/lib/utils/andars/AndarHelpers';
import { isEditMode, transformModuloToFormData } from '@/lib/utils/andars/ModuloDataFormTransformer';
import { Instituicao, Modulo, Unidade } from '@/types';
import { useForm } from '@inertiajs/react';
import { forwardRef, useEffect, useMemo, useRef } from 'react';
import { CadastrarModuloForm } from '../CadastrarModulo';
import { AndarFormData } from './AndarFormCard';
import AndaresManager from './AndarManager';
import AndarStickFormActions from './AndarStickFormActions';

export type ModuloFormProps = {
    data: CadastrarModuloForm;
    setData: ReturnType<typeof useForm<CadastrarModuloForm>>['setData'];
    submit: (e: React.FormEvent<HTMLFormElement>) => void;
    errors: Record<string, string>;
    processing: boolean;
    title: string;
    description: string;
    instituicao: Instituicao;
    unidades: Unidade[];
    modulo?: Modulo;
};
export default function ModuloForm({
    data,
    setData,
    submit,
    errors,
    processing,
    title,
    description,
    instituicao,
    unidades,
    modulo,
}: ModuloFormProps) {
    const topRef = useRef<HTMLDivElement>(null);
    const andaresRef = useRef<HTMLDivElement>(null);

    // Criar um Card com forwardRef para a seção de andares
    const AndaresCard = forwardRef<HTMLDivElement, { children: React.ReactNode }>(({ children }, ref) => <Card ref={ref}>{children}</Card>);
    AndaresCard.displayName = 'AndaresCard';

    // Inicializar dados do formulário
    useEffect(() => {
        if (modulo && isEditMode(modulo)) {
            const formData = transformModuloToFormData(modulo);
            // Garantir que tem térreo mesmo nos dados vindos do backend
            const andaresComTerreo = garantirTerreo(formData.andares);
            setData({
                ...formData,
                andares: andaresComTerreo.map((andar) => ({ ...andar, nome: nivelParaNome(andar.nivel) })),
            });
        } else if (data.andares.length === 0) {
            // Se não é edição e não tem andares, criar térreo inicial
            setData((prev) => ({
                ...prev,
                andares: [criarTerreoInicial()],
            }));
        }
    }, [modulo, setData]);

    const unidadesFiltradas = useMemo(() => {
        return unidades.filter((unidade) => unidade.instituicao?.id === instituicao.id);
    }, [instituicao.id, unidades]);

    const handleAddAndar = (novoAndar: AndarFormData) => {
        setData((prev) => {
            const novosAndares = [...prev.andares, novoAndar];
            // Sempre garantir que tem térreo
            return {
                ...prev,
                andares: garantirTerreo(novosAndares),
            };
        });

        // Scroll suave para a seção de andares
        setTimeout(() => {
            andaresRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    };

    const handleUpdateAndar = (andarId: string, andarAtualizado: AndarFormData) => {
        setData((prev) => ({
            ...prev,
            andares: prev.andares.map((a) => (a.id === andarId ? andarAtualizado : a)),
        }));
    };

    const handleRemoveAndar = (andarId: string) => {
        setData((prev) => {
            // Encontrar o andar que está sendo removido
            const andarParaRemover = prev.andares.find((a) => a.id === andarId);

            // PROTEÇÃO EXTRA: Nunca permitir remover térreo
            if (andarParaRemover && andarParaRemover.nivel === 0) {
                console.warn('Tentativa de remover térreo bloqueada no handleRemoveAndar');
                return prev; // Não fazer nada
            }

            const novosAndares = prev.andares.filter((a) => a.id !== andarId);

            // Sempre garantir que tem térreo após remoção
            return {
                ...prev,
                andares: garantirTerreo(novosAndares),
            };
        });
    };

    const scrollToTop = () => {
        topRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const editMode = isEditMode(modulo);

    return (
        <div ref={topRef}>
            <form onSubmit={submit} className="space-y-6 pb-20">
                {/* Informações Básicas do Módulo */}
                <Card>
                    <CardHeader>
                        <CardTitle>{title}</CardTitle>
                        <CardDescription>{description}</CardDescription>
                        {editMode && <div className="text-muted-foreground text-sm">ID do Módulo: {modulo?.id}</div>}
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Select de Instituição */}
                        <div className="space-y-2">
                            <Label htmlFor="instituicao">Instituição</Label>
                            <Input id="instituicao" value={instituicao.nome} disabled />
                        </div>

                        {/* Select de Unidade */}
                        <div className="space-y-2">
                            <Label htmlFor="unidade_id">Unidade</Label>
                            <SelectUI
                                value={data.unidade_id}
                                onValueChange={(value) => setData((prev) => ({ ...prev, unidade_id: value }))}
                                disabled={processing}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione uma unidade" />
                                </SelectTrigger>
                                <SelectContent>
                                    {unidadesFiltradas.map((unidade) => (
                                        <SelectItem key={unidade.id} value={unidade.id.toString()}>
                                            {unidade.nome}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </SelectUI>
                            {errors.unidade_id && <p className="mt-1 text-sm text-red-500">{errors.unidade_id}</p>}
                        </div>

                        {/* Input Nome do Módulo */}
                        <div className="space-y-2">
                            <Label htmlFor="nome">Nome do módulo</Label>
                            <Input
                                id="nome"
                                value={data.nome}
                                onChange={(e) => setData((prev) => ({ ...prev, nome: e.target.value }))}
                                placeholder="Ex: Bloco Administrativo"
                            />
                            {errors.nome && <p className="mt-1 text-sm text-red-500">{errors.nome}</p>}
                        </div>
                    </CardContent>
                </Card>

                {/* Seção de Andares */}
                <AndaresCard ref={andaresRef}>
                    <CardHeader>
                        <CardTitle>Andares do Módulo</CardTitle>
                        <CardDescription>
                            Todo módulo possui térreo obrigatório. Adicione andares superiores ou subsolos conforme necessário.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AndaresManager
                            andares={data.andares}
                            onUpdate={handleUpdateAndar}
                            onRemove={handleRemoveAndar}
                            onAdd={handleAddAndar}
                            errors={errors}
                            processing={processing}
                        />
                    </CardContent>
                </AndaresCard>

                {/* Botões de Ação Fixos */}
                <Card>
                    <CardFooter className="flex justify-end space-x-2">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Salvando...' : editMode ? 'Atualizar Módulo' : 'Salvar Módulo'}
                        </Button>
                    </CardFooter>
                </Card>
            </form>

            {/* Ações Sticky */}
            <AndarStickFormActions processing={processing} isEditMode={editMode} onScrollToTop={scrollToTop} andaresCount={data.andares.length} />
        </div>
    );
}
