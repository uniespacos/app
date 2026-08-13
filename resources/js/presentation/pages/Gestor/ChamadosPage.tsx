import { Head, router } from '@inertiajs/react';
import { AlertCircle, Camera, Mail, MapPin } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/presentation/templates/app-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Fila de Chamados',
        href: '/gestor/chamados',
    },
];

interface Chamado {
    id: number;
    protocolo: string;
    categoria: string;
    categoria_valor: string;
    status: string;
    status_valor: string;
    descricao: string;
    fotos: string[];
    contato_nome: string | null;
    contato_email: string | null;
    criado_em: string | null;
    espaco: string | null;
    localizacao: string | null;
}

interface Opcao {
    value: string;
    label: string;
}

interface Props {
    chamados: {
        data: Chamado[];
        links: { url: string | null; label: string; active: boolean }[];
        total: number;
    };
    filters: { status?: string; categoria?: string };
    categorias: (Opcao & { descricao: string })[];
    statusDisponiveis: Opcao[];
    totalAbertos: number;
}

const CORES_STATUS: Record<string, string> = {
    aberto: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200',
    em_andamento: 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200',
    resolvido: 'bg-green-100 text-green-900 dark:bg-green-950 dark:text-green-200',
    cancelado: 'bg-muted text-muted-foreground',
};

export default function ChamadosPage({ chamados, filters, categorias, statusDisponiveis, totalAbertos }: Props) {
    const filtrar = (campo: 'status' | 'categoria', valor: string) => {
        const novos = { ...filters, [campo]: valor || undefined };
        router.get(route('gestor.chamados.index'), novos, { preserveState: true, replace: true });
    };

    const alterarStatus = (chamado: Chamado, status: string) => {
        router.patch(route('gestor.chamados.update', { chamado: chamado.id }), { status }, { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Fila de Chamados" />

            <div className="space-y-6 p-4">
                <header className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold">Fila de Chamados</h1>
                        <p className="text-muted-foreground text-sm">
                            Problemas reportados nos espaços sob sua responsabilidade.
                        </p>
                    </div>
                    {totalAbertos > 0 && (
                        <Badge variant="secondary" className="gap-1.5">
                            <AlertCircle className="h-3.5 w-3.5" />
                            {totalAbertos} em aberto
                        </Badge>
                    )}
                </header>

                <div className="flex flex-wrap gap-3">
                    <select
                        value={filters.status ?? ''}
                        onChange={(e) => filtrar('status', e.target.value)}
                        className="border-input bg-background h-9 rounded-md border px-3 text-sm"
                    >
                        <option value="">Todas as situações</option>
                        {statusDisponiveis.map((s) => (
                            <option key={s.value} value={s.value}>
                                {s.label}
                            </option>
                        ))}
                    </select>

                    <select
                        value={filters.categoria ?? ''}
                        onChange={(e) => filtrar('categoria', e.target.value)}
                        className="border-input bg-background h-9 rounded-md border px-3 text-sm"
                    >
                        <option value="">Todos os tipos</option>
                        {categorias.map((c) => (
                            <option key={c.value} value={c.value}>
                                {c.label}
                            </option>
                        ))}
                    </select>
                </div>

                {chamados.data.length === 0 ? (
                    <div className="text-muted-foreground rounded-lg border border-dashed p-12 text-center">
                        <AlertCircle className="mx-auto mb-3 h-8 w-8 opacity-50" />
                        <p>Nenhum chamado por aqui.</p>
                        <p className="text-sm">
                            Os problemas reportados via QR Code nos espaços sob sua responsabilidade aparecem nesta
                            lista.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {chamados.data.map((chamado) => (
                            <article key={chamado.id} className="space-y-3 rounded-lg border p-4">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="min-w-0 space-y-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Badge className={CORES_STATUS[chamado.status_valor] ?? ''}>{chamado.status}</Badge>
                                            <Badge variant="outline">{chamado.categoria}</Badge>
                                            <span className="text-muted-foreground text-xs">{chamado.criado_em}</span>
                                        </div>
                                        <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
                                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                                            <span className="font-medium text-foreground">{chamado.espaco}</span>
                                            <span className="truncate">· {chamado.localizacao}</span>
                                        </div>
                                    </div>

                                    <select
                                        value={chamado.status_valor}
                                        onChange={(e) => alterarStatus(chamado, e.target.value)}
                                        className="border-input bg-background h-9 rounded-md border px-3 text-sm"
                                    >
                                        {statusDisponiveis.map((s) => (
                                            <option key={s.value} value={s.value}>
                                                {s.label}
                                            </option>
                                        ))}
                                    </select>
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

                                <footer className="text-muted-foreground flex flex-wrap items-center gap-4 border-t pt-3 text-xs">
                                    <span className="font-mono">{chamado.protocolo}</span>
                                    {chamado.contato_email ? (
                                        <span className="flex items-center gap-1.5">
                                            <Mail className="h-3.5 w-3.5" />
                                            {chamado.contato_nome ?? 'Sem nome'} · {chamado.contato_email}
                                        </span>
                                    ) : (
                                        <span>Report anônimo</span>
                                    )}
                                    {chamado.fotos.length > 0 && (
                                        <span className="flex items-center gap-1.5">
                                            <Camera className="h-3.5 w-3.5" />
                                            {chamado.fotos.length} foto(s)
                                        </span>
                                    )}
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
