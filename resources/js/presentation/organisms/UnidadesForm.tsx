import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CadastrarUnidadeForm } from '@/presentation/pages/Administrativo/Unidades/CadastrarUnidade';
import { Instituicao } from '@/types';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';

interface UnidadeFormProps {
    data: CadastrarUnidadeForm;
    setData: ReturnType<typeof useForm<CadastrarUnidadeForm>>['setData'];
    submit: (e: React.FormEvent<HTMLFormElement>) => void;
    errors: Record<string, string>;
    processing: boolean;
    title: string;
    description: string;
    instituicao: Instituicao;
}
export default function UnidadeForm({ data, setData, submit, errors, processing, title, description, instituicao }: UnidadeFormProps) {
    useEffect(() => {
        setData((prevData: CadastrarUnidadeForm) => ({ ...prevData, instituicao_id: instituicao.id.toString() }));
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
                            onChange={(e) => {
                                setData((prevData: CadastrarUnidadeForm) => ({ ...prevData, nome: e.target.value }));
                            }}
                            placeholder="Ex: Jequié ou Vitória da Conquista ..."
                        />
                        {errors.nome && <p className="text-destructive mt-1 text-sm">{errors.nome}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="sigla">SIGLA da unidade</Label>
                        <Input
                            id="sigla"
                            value={data.sigla}
                            onChange={(e) => {
                                setData((prevData: CadastrarUnidadeForm) => ({ ...prevData, sigla: e.target.value }));
                            }}
                            placeholder="Ex: JQ ou VCA ..."
                        />
                        {errors.sigla && <p className="text-destructive mt-1 text-sm">{errors.sigla}</p>}
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
