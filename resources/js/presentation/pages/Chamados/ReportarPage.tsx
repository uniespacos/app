import { Head, useForm } from '@inertiajs/react';
import { Camera, LoaderCircle, MapPin, X } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import InputError from '@/presentation/atoms/input-error';

interface Opcao {
    value: number;
    label: string;
    descricao: string | null;
}

interface EspacoReport {
    id: string;
    nome: string;
    localizacao: string;
    chamados_abertos: number;
}

interface Honeypot {
    enabled: boolean;
    nameFieldName: string;
    validFromFieldName: string;
    encryptedValidFrom: string;
}

interface Props {
    espaco: EspacoReport;
    tipos: Opcao[];
    categorias: Opcao[];
    catalogoVazio: boolean;
    honeypot: Honeypot;
}

type ReportForm = {
    tipo_id: number | '';
    categoria_id: number | '';
    descricao: string;
    contato_nome: string;
    contato_email: string;
    fotos: File[];
};

export default function ReportarPage({ espaco, tipos, categorias, catalogoVazio, honeypot }: Props) {
    const [previews, setPreviews] = useState<string[]>([]);

    const [isca, setIsca] = useState('');

    const { data, setData, post, processing, errors, transform } = useForm<ReportForm>({
        tipo_id: '',
        categoria_id: '',
        descricao: '',
        contato_nome: '',
        contato_email: '',
        fotos: [],
    });

    if (honeypot.enabled) {
        transform((dados) => ({
            ...dados,
            [honeypot.nameFieldName]: isca,
            [honeypot.validFromFieldName]: honeypot.encryptedValidFrom,
        }));
    }

    const handleFotos = (e: React.ChangeEvent<HTMLInputElement>) => {
        const arquivos = Array.from(e.target.files ?? []).slice(0, 3);
        setData('fotos', arquivos);
        setPreviews(arquivos.map((arquivo) => URL.createObjectURL(arquivo)));
    };

    const removerFotos = () => {
        setData('fotos', []);
        setPreviews([]);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('chamados.reportar.store', { espaco: espaco.id }), {
            forceFormData: true,
        });
    };

    return (
        <div className="bg-background flex min-h-svh flex-col items-center p-4 md:p-10">
            <Head title={`Fale sobre este espaço — ${espaco.nome}`} />

            <div className="w-full max-w-lg space-y-6">
                <header className="space-y-2 pt-4 text-center">
                    <h1 className="text-2xl font-semibold">Fale sobre este espaço</h1>
                    <p className="text-muted-foreground text-sm">
                        Você não precisa fazer login. Conte o que aconteceu e a gestão do espaço será avisada.
                    </p>
                </header>

                <div className="bg-muted/50 rounded-lg border p-4">
                    <div className="flex items-start gap-3">
                        <MapPin className="text-muted-foreground mt-0.5 h-5 w-5 shrink-0" />
                        <div className="min-w-0">
                            <p className="font-medium">{espaco.nome}</p>
                            <p className="text-muted-foreground truncate text-sm">{espaco.localizacao}</p>
                        </div>
                    </div>
                    {espaco.chamados_abertos > 0 && (
                        <p className="text-muted-foreground mt-3 border-t pt-3 text-sm">
                            Já existe{espaco.chamados_abertos > 1 ? 'm' : ''}{' '}
                            <strong>
                                {espaco.chamados_abertos} chamado{espaco.chamados_abertos > 1 ? 's' : ''} em aberto
                            </strong>{' '}
                            neste espaço. Se for o mesmo problema, não é necessário reportar de novo.
                        </p>
                    )}
                </div>

                {catalogoVazio && (
                    <div className="rounded-lg border border-dashed p-6 text-center">
                        <p className="font-medium">Registros indisponíveis no momento</p>
                        <p className="text-muted-foreground mt-1 text-sm">
                            A gestão ainda não configurou as opções deste formulário. Tente novamente mais tarde ou procure a secretaria do setor.
                        </p>
                    </div>
                )}

                {!catalogoVazio && (
                    <form onSubmit={submit} className="space-y-6">
                        {honeypot.enabled && (
                            <div aria-hidden="true" className="hidden">
                                <input
                                    type="text"
                                    name={honeypot.nameFieldName}
                                    id={honeypot.nameFieldName}
                                    value={isca}
                                    onChange={(e) => setIsca(e.target.value)}
                                    tabIndex={-1}
                                    autoComplete="off"
                                />
                            </div>
                        )}

                        <fieldset className="space-y-3">
                            <legend className="mb-3 text-sm font-medium">O que você quer registrar?</legend>
                            <div className="grid gap-2">
                                {tipos.map((tipo) => (
                                    <label
                                        key={tipo.value}
                                        className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                                            data.tipo_id === tipo.value ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="tipo_id"
                                            value={tipo.value}
                                            checked={data.tipo_id === tipo.value}
                                            onChange={() => setData('tipo_id', tipo.value)}
                                            className="mt-1"
                                        />
                                        <span className="min-w-0">
                                            <span className="block font-medium">{tipo.label}</span>
                                            {tipo.descricao && <span className="text-muted-foreground block text-sm">{tipo.descricao}</span>}
                                        </span>
                                    </label>
                                ))}
                            </div>
                            <InputError message={errors.tipo_id} />
                        </fieldset>

                        <fieldset className="space-y-3">
                            <legend className="mb-3 text-sm font-medium">Sobre o que é?</legend>
                            <div className="grid gap-2">
                                {categorias.map((categoria) => (
                                    <label
                                        key={categoria.value}
                                        className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                                            data.categoria_id === categoria.value ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="categoria_id"
                                            value={categoria.value}
                                            checked={data.categoria_id === categoria.value}
                                            onChange={() => setData('categoria_id', categoria.value)}
                                            className="mt-1"
                                        />
                                        <span className="min-w-0">
                                            <span className="block font-medium">{categoria.label}</span>
                                            {categoria.descricao && (
                                                <span className="text-muted-foreground block text-sm">{categoria.descricao}</span>
                                            )}
                                        </span>
                                    </label>
                                ))}
                            </div>
                            <InputError message={errors.categoria_id} />
                        </fieldset>

                        <div className="grid gap-2">
                            <Label htmlFor="descricao">O que está acontecendo?</Label>
                            <Textarea
                                id="descricao"
                                rows={4}
                                value={data.descricao}
                                onChange={(e) => setData('descricao', e.target.value)}
                                placeholder="Ex.: a lâmpada do fundo da sala está queimada desde segunda-feira."
                            />
                            <InputError message={errors.descricao} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="fotos">Fotos (opcional, até 3)</Label>
                            <label
                                htmlFor="fotos"
                                className="hover:bg-muted/50 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed p-4 text-sm transition-colors"
                            >
                                <Camera className="h-5 w-5" />
                                {data.fotos.length > 0 ? `${data.fotos.length} foto(s) selecionada(s)` : 'Tirar foto ou escolher da galeria'}
                            </label>
                            <input
                                id="fotos"
                                type="file"
                                accept="image/*"
                                capture="environment"
                                multiple
                                onChange={handleFotos}
                                className="sr-only"
                            />
                            {previews.length > 0 && (
                                <div className="flex flex-wrap items-center gap-2">
                                    {previews.map((preview) => (
                                        <img key={preview} src={preview} alt="" className="h-16 w-16 rounded border object-cover" />
                                    ))}
                                    <Button type="button" variant="ghost" size="sm" onClick={removerFotos}>
                                        <X className="mr-1 h-4 w-4" />
                                        Remover
                                    </Button>
                                </div>
                            )}
                            <InputError message={errors.fotos} />
                        </div>

                        <fieldset className="space-y-4 border-t pt-4">
                            <legend className="text-muted-foreground text-sm">
                                Quer saber quando for respondido? Deixe seu contato — é opcional.
                            </legend>
                            <div className="grid gap-2">
                                <Label htmlFor="contato_nome">Seu nome</Label>
                                <Input
                                    id="contato_nome"
                                    value={data.contato_nome}
                                    onChange={(e) => setData('contato_nome', e.target.value)}
                                    autoComplete="name"
                                />
                                <InputError message={errors.contato_nome} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="contato_email">Seu e-mail</Label>
                                <Input
                                    id="contato_email"
                                    type="email"
                                    value={data.contato_email}
                                    onChange={(e) => setData('contato_email', e.target.value)}
                                    autoComplete="email"
                                />
                                <InputError message={errors.contato_email} />
                            </div>
                        </fieldset>

                        <Button type="submit" className="w-full" disabled={processing}>
                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Enviar registro
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
}
