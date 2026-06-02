import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Instituicao } from '@/types';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { CadastrarUnidadeForm } from '../CadastrarUnidade';

type UnidadeFormProps = {
    data: CadastrarUnidadeForm;
    setData: ReturnType<typeof useForm<CadastrarUnidadeForm>>['setData'];
    submit: (e: React.FormEvent<HTMLFormElement>) => void;
    errors: Record<string, string>;
    processing: boolean;
    title: string;
    description: string;
    instituicao: Instituicao;
};
export default function UnidadeForm({ data, setData, submit, errors, processing, title, description, instituicao }: UnidadeFormProps) {
    useEffect(() => {
        setData((prevData) => ({ ...prevData, instituicao_id: instituicao.id.toString() }));
    }, [instituicao, setData]);
    return (
        <form onSubmit={submit}>
            <Card>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="instituicao">Instituicao</Label>
                        <Input id="instituicao" value={instituicao.nome} disabled />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="nome">Nome da unidade</Label>
                        <Input
                            id="nome"
                            value={data.nome}
                            onChange={(e) => setData((prevData) => ({ ...prevData, nome: e.target.value }))}
                            placeholder="Ex: Jequié ou Vitória da Conquista ..."
                        />
                        {errors.nome && <p className="mt-1 text-sm text-red-500">{errors.nome}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="sigla">SIGLA da unidade</Label>
                        <Input
                            id="sigla"
                            value={data.sigla}
                            onChange={(e) => setData((prevData) => ({ ...prevData, sigla: e.target.value }))}
                            placeholder="Ex: JQ ou VCA ..."
                        />
                        {errors.sigla && <p className="mt-1 text-sm text-red-500">{errors.sigla}</p>}
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={processing}>
                        {processing ? 'Salvando...' : 'Salvar'}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}
