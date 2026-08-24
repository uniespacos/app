import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDadosRelatorio } from '@/hooks/use-dados-relatorio';
import { useGerarRelatorio } from '@/hooks/use-gerar-relatorio';
import { ExportarRelatorio } from '@/presentation/organisms/ExportarRelatorio';
import { FiltrosInventarioEspacos } from '@/presentation/organisms/FiltrosInventarioEspacos';
import { FiltrosOcupacaoEspacos } from '@/presentation/organisms/FiltrosOcupacaoEspacos';
import { FiltrosReservasPeriodo } from '@/presentation/organisms/FiltrosReservasPeriodo';
import AppLayout from '@/presentation/templates/AppLayout';
import { FiltrosRelatorio, FormatoRelatorio, OpcoesInventario, TipoRelatorio, TipoRelatorioOption } from '@/types';
import { BarChart3 } from 'lucide-react';
import { lazy, Suspense, useState } from 'react';

const GraficoReservasPeriodo = lazy(() => import('@/presentation/organisms/GraficoReservasPeriodo'));
const GraficoOcupacaoEspacos = lazy(() => import('@/presentation/organisms/GraficoOcupacaoEspacos'));
const GraficoInventarioEspacos = lazy(() => import('@/presentation/organisms/GraficoInventarioEspacos'));

interface Props {
    tipos_disponiveis: TipoRelatorioOption[];
    opcoes_inventario: OpcoesInventario;
}

export default function RelatoriosGestorPage({ tipos_disponiveis, opcoes_inventario }: Props) {
    const [tipoSelecionado, setTipoSelecionado] = useState<TipoRelatorio | undefined>();
    const [filtros, setFiltros] = useState<Partial<FiltrosRelatorio>>({});

    const { gerar, estaGerando } = useGerarRelatorio('/gestor/relatorios/gerar');
    const { dados, status, erro } = useDadosRelatorio('/gestor/relatorios/dados', tipoSelecionado, filtros);

    const handleExport = (formato: FormatoRelatorio) => {
        if (!tipoSelecionado) return;
        void gerar({ tipo: tipoSelecionado, formato, filtros });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Relatórios', href: '/gestor/relatorios' }]}>
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Relatórios</h1>
                        <p className="text-muted-foreground">Acompanhe os espaços que você gerencia e exporte quando precisar.</p>
                    </div>
                    <ExportarRelatorio onExport={handleExport} estaGerando={estaGerando} disabled={!tipoSelecionado} />
                </div>

                <Tabs
                    value={tipoSelecionado}
                    onValueChange={(value) => {
                        setTipoSelecionado(value as TipoRelatorio);
                    }}
                >
                    <TabsList className="flex h-auto flex-wrap justify-start gap-1">
                        {tipos_disponiveis.map((tipo) => (
                            <TabsTrigger key={tipo.value} value={tipo.value}>
                                {tipo.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>

                {!tipoSelecionado && (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                            <BarChart3 className="text-muted-foreground h-8 w-8" />
                            <p className="text-muted-foreground text-sm">Selecione um tipo de relatório para visualizar os dados.</p>
                        </CardContent>
                    </Card>
                )}

                {tipoSelecionado && (
                    <>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">Filtros</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {tipoSelecionado === 'reservas_periodo' && <FiltrosReservasPeriodo filtros={filtros} onChange={setFiltros} />}
                                {tipoSelecionado === 'ocupacao_espacos' && <FiltrosOcupacaoEspacos filtros={filtros} onChange={setFiltros} />}
                                {tipoSelecionado === 'inventario_espacos' && (
                                    <FiltrosInventarioEspacos filtros={filtros} opcoes={opcoes_inventario} onChange={setFiltros} />
                                )}
                            </CardContent>
                        </Card>

                        <div className="space-y-4">
                            {status === 'loading' && (
                                <div className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                        {Array.from({ length: 4 }).map((_, index) => (
                                            <Skeleton key={index} className="h-28 w-full" />
                                        ))}
                                    </div>
                                    <Skeleton className="h-[320px] w-full" />
                                </div>
                            )}

                            {status === 'error' && (
                                <Alert variant="destructive">
                                    <AlertDescription>{erro}</AlertDescription>
                                </Alert>
                            )}

                            {status === 'empty' && (
                                <Card className="border-dashed">
                                    <CardContent className="text-muted-foreground py-16 text-center text-sm">
                                        Nenhum dado para os filtros selecionados.
                                    </CardContent>
                                </Card>
                            )}

                            {status === 'success' && dados && (
                                <Suspense fallback={<Skeleton className="h-[320px] w-full" />}>
                                    {tipoSelecionado === 'reservas_periodo' && <GraficoReservasPeriodo dados={dados} />}
                                    {tipoSelecionado === 'ocupacao_espacos' && <GraficoOcupacaoEspacos dados={dados} />}
                                    {tipoSelecionado === 'inventario_espacos' && <GraficoInventarioEspacos dados={dados} />}
                                </Suspense>
                            )}
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
