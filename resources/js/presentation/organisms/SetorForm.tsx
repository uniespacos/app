import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Instituicao, Setor, Unidade } from '@/types';
import { MapPin } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';

export interface SetorFormData {
    nome: string;
    sigla: string;
    unidade_id: string;
}

interface Props {
    setor?: Setor;
    instituicao: Instituicao;
    unidades: Unidade[];
    onSubmit: (data: SetorFormData) => void;
    onCancel: () => void;
}

export function SetorForm({ setor, instituicao, onSubmit, onCancel }: Props) {
    const [selectedInstituicao, setSelectedInstituicao] = useState<string>('');
    const [filteredUnidades, setFilteredUnidades] = useState<Unidade[]>([]);
    const [processing, setProcessing] = useState<boolean>(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Estados do formulário
    const [nome, setNome] = useState<string>(setor?.nome || '');
    const [sigla, setSigla] = useState<string>(setor?.sigla || '');
    const [unidadeId, setUnidadeId] = useState<string>(setor?.unidade?.id?.toString() || '');

    // Inicializar valores se estiver editando
    useEffect(() => {
        if (setor?.unidade?.instituicao) {
            setSelectedInstituicao(setor.unidade.instituicao.id.toString());
        }
    }, [setor]);

    // Filtrar unidades baseado na instituição selecionada
    useEffect(() => {
        const newFilteredUnidades = instituicao?.unidades || [];
        setFilteredUnidades(newFilteredUnidades);

        if (unidadeId && !newFilteredUnidades.find((u) => u.id.toString() === unidadeId)) {
            setUnidadeId('');
        }
    }, [selectedInstituicao, unidadeId, setor?.unidade?.id, instituicao?.unidades]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!nome.trim()) newErrors.nome = 'Nome é obrigatório';
        if (!sigla.trim()) newErrors.sigla = 'Sigla é obrigatória';
        if (!unidadeId) newErrors.unidade_id = 'Unidade é obrigatória';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setProcessing(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));

        onSubmit({
            nome: nome.trim(),
            sigla: sigla.trim().toUpperCase(),
            unidade_id: unidadeId,
        });

        setProcessing(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Seleção de Instituição */}
            <div className="space-y-2">
                <Label>Instituição</Label>
                <Input value={instituicao.nome} disabled />
            </div>

            {/* Seleção de Unidade */}
            <div className="space-y-2">
                <Label>Unidade *</Label>
                <Select value={unidadeId} onValueChange={setUnidadeId}>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecione uma unidade" />
                    </SelectTrigger>
                    <SelectContent>
                        {filteredUnidades.map((unidade) => (
                            <SelectItem key={unidade.id} value={unidade.id.toString()}>
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    {unidade.sigla} - {unidade.nome}
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.unidade_id && (
                    <Alert variant="destructive">
                        <AlertDescription>{errors.unidade_id}</AlertDescription>
                    </Alert>
                )}
            </div>

            {/* Nome do Setor */}
            <div className="space-y-2">
                <Label>Nome do Setor *</Label>
                <Input
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Recursos Humanos"
                    className={errors.nome ? 'border-destructive' : ''}
                />
                {errors.nome && (
                    <Alert variant="destructive">
                        <AlertDescription>{errors.nome}</AlertDescription>
                    </Alert>
                )}
            </div>

            {/* Sigla do Setor */}
            <div className="space-y-2">
                <Label>Sigla *</Label>
                <Input
                    value={sigla}
                    onChange={(e) => setSigla(e.target.value.toUpperCase())}
                    placeholder="Ex: RH"
                    maxLength={10}
                    className={errors.sigla ? 'border-destructive' : ''}
                />
                {errors.sigla && (
                    <Alert variant="destructive">
                        <AlertDescription>{errors.sigla}</AlertDescription>
                    </Alert>
                )}
            </div>

            {/* Botões */}
            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel} disabled={processing}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={processing}>
                    {processing ? 'Salvando...' : setor ? 'Atualizar' : 'Criar Setor'}
                </Button>
            </div>
        </form>
    );
}
