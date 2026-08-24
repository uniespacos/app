import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormField } from '@/presentation/molecules/FormField';
import { Instituicao, Setor, Unidade } from '@/types';
import { MapPin } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';

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

export function SetorForm({ setor, instituicao, unidades, onSubmit, onCancel }: Props) {
    const [nome, setNome] = useState<string>(setor?.nome ?? '');
    const [sigla, setSigla] = useState<string>(setor?.sigla ?? '');
    const [unidadeId, setUnidadeId] = useState<string>(setor?.unidade?.id.toString() ?? '');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors: Record<string, string> = {};
        if (!nome.trim()) newErrors.nome = 'Nome é obrigatório';
        if (!sigla.trim()) newErrors.sigla = 'Sigla é obrigatória';
        if (!unidadeId) newErrors.unidade_id = 'Unidade é obrigatória';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onSubmit({
            nome: nome.trim(),
            sigla: sigla.trim().toUpperCase(),
            unidade_id: unidadeId,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Instituição" htmlFor="instituicao">
                <Input id="instituicao" value={instituicao.nome} disabled />
            </FormField>

            <FormField label="Unidade" htmlFor="unidade" error={errors.unidade_id} required>
                <Select value={unidadeId} onValueChange={setUnidadeId}>
                    <SelectTrigger id="unidade">
                        <SelectValue placeholder="Selecione uma unidade" />
                    </SelectTrigger>
                    <SelectContent>
                        {unidades.map((unidade) => (
                            <SelectItem key={unidade.id} value={unidade.id.toString()}>
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    {unidade.sigla} - {unidade.nome}
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </FormField>

            <FormField label="Nome do Setor" htmlFor="nome" error={errors.nome} required>
                <Input
                    id="nome"
                    value={nome}
                    onChange={(e) => {
                        setNome(e.target.value);
                    }}
                    placeholder="Ex: Recursos Humanos"
                />
            </FormField>

            <FormField label="Sigla" htmlFor="sigla" error={errors.sigla} required>
                <Input
                    id="sigla"
                    value={sigla}
                    onChange={(e) => {
                        setSigla(e.target.value.toUpperCase());
                    }}
                    placeholder="Ex: RH"
                    maxLength={10}
                />
            </FormField>

            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancelar
                </Button>
                <Button type="submit">{setor ? 'Atualizar' : 'Criar Setor'}</Button>
            </div>
        </form>
    );
}
