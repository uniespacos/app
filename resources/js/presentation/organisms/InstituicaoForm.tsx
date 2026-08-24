import { IFormHandler } from '@/application/ports/form-handler.interface';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CadastrarInstituicaoForm } from '@/presentation/pages/Administrativo/Instituicoes/CadastrarInstituicao';

interface InstituicaoFormProps {
    data: CadastrarInstituicaoForm;
    setData: IFormHandler<CadastrarInstituicaoForm>['setData'];
    submit: (e: React.FormEvent<HTMLFormElement>) => void;
    errors: Record<string, string>;
    processing: boolean;
    title: string;
    description: string;
}

export default function InstituicaoForm({ data, setData, submit, errors, processing, title, description }: InstituicaoFormProps) {
    return (
        <form onSubmit={submit}>
            <Card>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="nome">Nome da Instituição</Label>
                        <Input
                            id="nome"
                            value={data.nome}
                            onChange={(e) => {
                                setData('nome', e.target.value);
                            }}
                            placeholder="Ex: Universidade Federal da Bahia"
                        />
                        {errors.nome && <p className="text-destructive mt-1 text-sm">{errors.nome}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="sigla">Sigla</Label>
                        <Input
                            id="sigla"
                            value={data.sigla}
                            onChange={(e) => {
                                setData('sigla', e.target.value);
                            }}
                            placeholder="Ex: UFBA"
                        />
                        {errors.sigla && <p className="text-destructive mt-1 text-sm">{errors.sigla}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="endereco">Endereço</Label>
                        <Input
                            id="endereco"
                            value={data.endereco}
                            onChange={(e) => {
                                setData('endereco', e.target.value);
                            }}
                            placeholder="Ex: Rua Barão de Jeremoabo, s/n"
                        />
                        {errors.endereco && <p className="text-destructive mt-1 text-sm">{errors.endereco}</p>}
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
