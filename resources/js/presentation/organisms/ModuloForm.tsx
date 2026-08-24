/* eslint-disable react-hooks/exhaustive-deps */
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SelectContent, SelectItem, SelectTrigger, Select as SelectUI, SelectValue } from '@/components/ui/select';
import { criarTerreoInicial, garantirTerreo, nivelParaNome } from '@/lib/utils/andars/AndarHelpers';
import { isEditMode, transformModuloToFormData } from '@/lib/utils/andars/ModuloDataFormTransformer';
import AndarStickFormActions from '@/presentation/molecules/AndarStickFormActions';
import { AndarFormData } from '@/presentation/organisms/AndarFormCard';
import AndaresManager from '@/presentation/organisms/AndarManager';
import { CadastrarModuloForm } from '@/presentation/pages/Administrativo/Modulos/CadastrarModulo';
import { Instituicao, Modulo, Unidade } from '@/types';
import { useForm } from '@inertiajs/react';
import { forwardRef, useEffect, useMemo, useRef } from 'react';

export interface ModuloFormProps {
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
}
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

    const AndaresCard = forwardRef<HTMLDivElement, { children: React.ReactNode }>(({ children }, ref) => <Card ref={ref}>{children}</Card>);
    AndaresCard.displayName = 'AndaresCard';

    useEffect(() => {
        if (modulo && isEditMode(modulo)) {
            const formData = transformModuloToFormData(modulo);
            const andaresComTerreo = garantirTerreo(formData.andares);
            setData({
                ...formData,
                andares: andaresComTerreo.map((andar) => ({ ...andar, nome: nivelParaNome(andar.nivel) })),
            });
        } else if (data.andares.length === 0) {
            setData((prev: CadastrarModuloForm) => ({
                ...prev,
                andares: [criarTerreoInicial()],
            }));
        }
    }, [modulo, setData]);

    const unidadesFiltradas = useMemo(() => {
        return unidades.filter((unidade) => unidade.instituicao?.id === instituicao.id);
    }, [instituicao.id, unidades]);

    const handleAddAndar = (novoAndar: AndarFormData) => {
        setData((prev: CadastrarModuloForm) => {
            const novosAndares = [...prev.andares, novoAndar];
            return {
                ...prev,
                andares: garantirTerreo(novosAndares),
            };
        });

        setTimeout(() => {
            andaresRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    };

    const handleUpdateAndar = (andarId: string, andarAtualizado: AndarFormData) => {
        setData((prev: CadastrarModuloForm) => ({
            ...prev,
            andares: prev.andares.map((a: AndarFormData) => (a.id === andarId ? andarAtualizado : a)),
        }));
    };

    const handleRemoveAndar = (andarId: string) => {
        setData((prev: CadastrarModuloForm) => {
            const andarParaRemover = prev.andares.find((a: AndarFormData) => a.id === andarId);

            if (andarParaRemover && andarParaRemover.nivel === 0) {
                console.warn('Tentativa de remover térreo bloqueada no handleRemoveAndar');
                return prev;
            }

            const novosAndares = prev.andares.filter((a: AndarFormData) => a.id !== andarId);

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
                <Card>
                    <CardHeader>
                        <CardTitle>{title}</CardTitle>
                        <CardDescription>{description}</CardDescription>
                        {editMode && <div className="text-muted-foreground text-sm">ID do Módulo: {modulo?.id}</div>}
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="instituicao">Instituição</Label>
                            <Input id="instituicao" value={instituicao.nome} disabled />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="unidade_id">Unidade</Label>
                            <SelectUI
                                value={data.unidade_id}
                                onValueChange={(value) => {
                                    setData((prev: CadastrarModuloForm) => ({ ...prev, unidade_id: value }));
                                }}
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
                            {errors.unidade_id && <p className="text-destructive mt-1 text-sm">{errors.unidade_id}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="nome">Nome do módulo</Label>
                            <Input
                                id="nome"
                                value={data.nome}
                                onChange={(e) => {
                                    setData((prev: CadastrarModuloForm) => ({ ...prev, nome: e.target.value }));
                                }}
                                placeholder="Ex: Bloco Administrativo"
                            />
                            {errors.nome && <p className="text-destructive mt-1 text-sm">{errors.nome}</p>}
                        </div>
                    </CardContent>
                </Card>

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

                <Card>
                    <CardFooter className="flex justify-end space-x-2">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Salvando...' : editMode ? 'Atualizar Módulo' : 'Salvar Módulo'}
                        </Button>
                    </CardFooter>
                </Card>
            </form>

            <AndarStickFormActions processing={processing} isEditMode={editMode} onScrollToTop={scrollToTop} andaresCount={data.andares.length} />
        </div>
    );
}
