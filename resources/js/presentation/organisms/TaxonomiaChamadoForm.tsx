'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import InputError from '@/presentation/atoms/input-error';
import { useState } from 'react';

export interface TaxonomiaChamadoFormData {
    nome: string;
    slug: string;
    descricao: string;
    ordem: number;
    exibe_alerta_espaco?: boolean;
}

interface Props {
    taxonomia?: TaxonomiaChamadoFormData | null;
    comAlerta: boolean;
    errors: Record<string, string>;
    processing: boolean;
    onSubmit: (data: TaxonomiaChamadoFormData) => void;
    onCancel: () => void;
}

const gerarSlug = (nome: string): string =>
    nome
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

export function TaxonomiaChamadoForm({ taxonomia, comAlerta, errors, processing, onSubmit, onCancel }: Props) {
    const [data, setData] = useState<TaxonomiaChamadoFormData>({
        nome: taxonomia?.nome ?? '',
        slug: taxonomia?.slug ?? '',
        descricao: taxonomia?.descricao ?? '',
        ordem: taxonomia?.ordem ?? 0,
        exibe_alerta_espaco: taxonomia?.exibe_alerta_espaco ?? false,
    });

    const alterarNome = (nome: string) => {
        setData((atual) => ({
            ...atual,
            nome,
            slug: taxonomia ? atual.slug : gerarSlug(nome),
        }));
    };

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit(data);
            }}
            className="space-y-4"
        >
            <div className="grid gap-2">
                <Label htmlFor="nome">Nome</Label>
                <Input id="nome" value={data.nome} onChange={(e) => alterarNome(e.target.value)} />
                <InputError message={errors.nome} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="slug">Identificador</Label>
                <Input id="slug" value={data.slug} onChange={(e) => setData({ ...data, slug: e.target.value })} />
                <p className="text-muted-foreground text-xs">Usado internamente. Apenas letras minúsculas, números e hífen.</p>
                <InputError message={errors.slug} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                    id="descricao"
                    rows={2}
                    value={data.descricao}
                    onChange={(e) => setData({ ...data, descricao: e.target.value })}
                    placeholder="Texto de apoio exibido a quem preenche o formulário público."
                />
                <InputError message={errors.descricao} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="ordem">Ordem</Label>
                <Input id="ordem" type="number" min={0} value={data.ordem} onChange={(e) => setData({ ...data, ordem: Number(e.target.value) })} />
                <p className="text-muted-foreground text-xs">Define a posição na lista do formulário público.</p>
                <InputError message={errors.ordem} />
            </div>

            {comAlerta && (
                <div className="flex items-start gap-3 rounded-lg border p-3">
                    <Checkbox
                        id="exibe_alerta_espaco"
                        checked={data.exibe_alerta_espaco}
                        onCheckedChange={(checked) => setData({ ...data, exibe_alerta_espaco: checked === true })}
                        className="mt-0.5"
                    />
                    <div className="min-w-0">
                        <Label htmlFor="exibe_alerta_espaco">Contar no alerta da tela de reserva</Label>
                        <p className="text-muted-foreground text-sm">
                            Quando marcado, os registros deste tipo aparecem no aviso exibido a quem está prestes a reservar o espaço. Faz sentido
                            para defeitos, não para sugestões.
                        </p>
                    </div>
                </div>
            )}

            <div className="flex justify-end gap-2 border-t pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={processing}>
                    Salvar
                </Button>
            </div>
        </form>
    );
}
