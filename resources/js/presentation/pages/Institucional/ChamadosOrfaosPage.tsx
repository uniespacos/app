import { Head, Link, router } from '@inertiajs/react';
import { TriangleAlert, UserPlus } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/presentation/templates/app-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Espaços sem responsável',
        href: '/institucional/chamados',
    },
];

interface ChamadoOrfao {
    id: number;
    protocolo: string;
    categoria: string;
    status: string;
    descricao: string;
    fotos: string[];
    criado_em: string | null;
    espaco: string | null;
    espaco_id: number | null;
    localizacao: string | null;
}

interface Props {
    chamados: {
        data: ChamadoOrfao[];
        links: { url: string | null; label: string; active: boolean }[];
        total: number;
    };
    filters: { categoria?: string };
    categorias: { value: string; label: string; descricao: string }[];
    totalOrfaos: number;
}

export default function ChamadosOrfaosPage({ chamados, filters, categorias, totalOrfaos }: Props) {
    const filtrar = (valor: string) => {
        router.get(route('institucional.chamados.index'), { categoria: valor || undefined }, { preserveState: true, replace: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Espaços sem responsável" />

            <div className="space-y-6 p-4">
                <header className="space-y-1">
                    <h1 className="text-2xl font-semibold">Espaços sem responsável</h1>
                    <p className="text-muted-foreground text-sm">
                        Problemas reportados em espaços que não têm ninguém atribuído em nenhum turno — por isso não
                        chegam a nenhuma fila de atendimento.
                    </p>
                </header>

                {totalOrfaos > 0 && (
                    <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
                        <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" />
                        <p className="text-sm">
                            <strong>
                                {totalOrfaos} chamado{totalOrfaos > 1 ? 's' : ''} aguardando responsável.
                            </strong>{' '}
                            Atribuir alguém às agendas do espaço faz com que os próximos reports cheguem direto a quem
                            atende.
                        </p>
                    </div>
                )}

                <select
                    value={filters.categoria ?? ''}
                    onChange={(e) => filtrar(e.target.value)}
                    className="border-input bg-background h-9 rounded-md border px-3 text-sm"
                >
                    <option value="">Todos os tipos</option>
                    {categorias.map((c) => (
                        <option key={c.value} value={c.value}>
                            {c.label}
                        </option>
                    ))}
                </select>

                {chamados.data.length === 0 ? (
                    <div className="text-muted-foreground rounded-lg border border-dashed p-12 text-center">
                        <p>Nenhum chamado sem responsável.</p>
                        <p className="text-sm">
                            Todos os espaços com problemas reportados já têm alguém atribuído para atender.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {chamados.data.map((chamado) => (
                            <article key={chamado.id} className="space-y-3 rounded-lg border p-4">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="min-w-0 space-y-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Badge variant="outline">{chamado.categoria}</Badge>
                                            <Badge variant="secondary">{chamado.status}</Badge>
                                            <span className="text-muted-foreground text-xs">{chamado.criado_em}</span>
                                        </div>
                                        <p className="font-medium">{chamado.espaco}</p>
                                        <p className="text-muted-foreground truncate text-sm">{chamado.localizacao}</p>
                                    </div>

                                    {chamado.espaco_id && (
                                        <Button asChild size="sm" variant="outline">
                                            <Link href={route('institucional.espacos.index')}>
                                                <UserPlus className="mr-1.5 h-4 w-4" />
                                                Atribuir responsável
                                            </Link>
                                        </Button>
                                    )}
                                </div>

                                <p className="text-sm whitespace-pre-line">{chamado.descricao}</p>

                                {chamado.fotos.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {chamado.fotos.map((foto) => (
                                            <a key={foto} href={foto} target="_blank" rel="noreferrer">
                                                <img
                                                    src={foto}
                                                    alt="Foto do problema"
                                                    className="h-20 w-20 rounded border object-cover transition-opacity hover:opacity-80"
                                                />
                                            </a>
                                        ))}
                                    </div>
                                )}

                                <footer className="text-muted-foreground border-t pt-3 font-mono text-xs">
                                    {chamado.protocolo}
                                </footer>
                            </article>
                        ))}
                    </div>
                )}

                {chamados.links.length > 3 && (
                    <nav className="flex flex-wrap justify-center gap-1">
                        {chamados.links.map((link) => (
                            <Button
                                key={link.label}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </nav>
                )}
            </div>
        </AppLayout>
    );
}
