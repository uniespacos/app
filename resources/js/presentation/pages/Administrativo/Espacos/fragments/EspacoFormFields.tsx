import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from '@inertiajs/react';
import { FormCadastroValues } from '../CadastroEspaco';

interface FormValues {
    nome: string;
    capacidade_pessoas: number | undefined;
    descricao: string;
}

interface EspacoFormFieldsProps {
    data: FormValues;
    setData: ReturnType<typeof useForm<FormCadastroValues>>['setData'];
    errors: Partial<Record<keyof FormValues, string>>;
    processing: boolean;
}

export function EspacoFormFields({ data, setData, errors, processing }: EspacoFormFieldsProps) {
    return (
        <>
            <div className="space-y-2">
                <Label htmlFor="name">Nome do Espaço</Label>
                <Input
                    id="name"
                    placeholder="Ex: Sala 101, Laboratório de Informática"
                    value={data.nome}
                    onChange={(e) => setData((prevData) => ({ ...prevData, nome: e.target.value }))}
                    disabled={processing}
                />
                {errors.nome && <p className="mt-1 text-sm text-red-500">{errors.nome}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="capacityPessoas">Capacidade (pessoas)</Label>
                <Input
                    id="capacityPessoas"
                    type="number"
                    min={1}
                    value={data.capacidade_pessoas || ''}
                    onChange={(e) => setData((prevData) => ({ ...prevData, capacidade_pessoas: e.target.valueAsNumber }))}
                    disabled={processing}
                />
                {errors.capacidade_pessoas && <p className="mt-1 text-sm text-red-500">{errors.capacidade_pessoas}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                    id="description"
                    placeholder="Descreva detalhes sobre o espaço..."
                    className="min-h-[120px]"
                    value={data.descricao}
                    onChange={(e) => setData((prevData) => ({ ...prevData, descricao: e.target.value }))}
                    disabled={processing}
                />
                {errors.descricao && <p className="mt-1 text-sm text-red-500">{errors.descricao}</p>}
            </div>
        </>
    );
}
