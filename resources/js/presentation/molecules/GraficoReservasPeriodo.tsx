import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TabelaDetalhamento } from '@/presentation/molecules/TabelaDetalhamento';
import { DadosRelatorio } from '@/types';
import { CalendarCheck, CircleCheck, CircleX, Clock } from 'lucide-react';
import { Cell, Pie, PieChart } from 'recharts';

interface Props {
    dados: DadosRelatorio;
}

const CORES = ['var(--chart-2)', 'var(--chart-4)', 'var(--chart-3)'];

function numero(valor: unknown): number {
    return Number(valor ?? 0);
}

function GraficoReservasPeriodo({ dados }: Props) {
    if (dados.linhas.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{dados.titulo}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-sm">Nenhuma reserva para os filtros selecionados.</p>
                </CardContent>
            </Card>
        );
    }

    const distribuicao = [
        { situacao: 'Deferidas', total: numero(dados.sumario['Deferidas']) },
        { situacao: 'Indeferidas', total: numero(dados.sumario['Indeferidas']) },
        { situacao: 'Em Análise', total: numero(dados.sumario['Em Análise']) },
    ];

    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Reservas</CardTitle>
                        <CalendarCheck className="text-muted-foreground h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{numero(dados.sumario['Total de Reservas'])}</div>
                        <p className="text-muted-foreground text-xs">No período</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Deferidas</CardTitle>
                        <CircleCheck className="text-muted-foreground h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{numero(dados.sumario['Deferidas'])}</div>
                        <p className="text-muted-foreground text-xs">Aprovadas</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Indeferidas</CardTitle>
                        <CircleX className="text-muted-foreground h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{numero(dados.sumario['Indeferidas'])}</div>
                        <p className="text-muted-foreground text-xs">Recusadas</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Em Análise</CardTitle>
                        <Clock className="text-muted-foreground h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{numero(dados.sumario['Em Análise'])}</div>
                        <p className="text-muted-foreground text-xs">Pendentes</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Distribuição por Situação</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {(() => {
                            const chartConfig = distribuicao.reduce((acc, d, i) => {
                                acc[d.situacao] = { label: d.situacao, color: CORES[i % CORES.length] };
                                return acc;
                            }, {} as ChartConfig);
                            return (
                                <ChartContainer config={chartConfig} className="aspect-auto h-[240px] w-full">
                                    <PieChart accessibilityLayer>
                                        <ChartTooltip content={<ChartTooltipContent nameKey="situacao" />} />
                                        <Pie data={distribuicao} dataKey="total" nameKey="situacao" innerRadius={60}>
                                            {distribuicao.map((item, index) => (
                                                <Cell key={item.situacao} fill={CORES[index % CORES.length]} />
                                            ))}
                                        </Pie>
                                        <ChartLegend content={<ChartLegendContent nameKey="situacao" />} />
                                    </PieChart>
                                </ChartContainer>
                            );
                        })()}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Resumo</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Situação</TableHead>
                                    <TableHead>Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {distribuicao.map((item) => (
                                    <TableRow key={item.situacao}>
                                        <TableCell>{item.situacao}</TableCell>
                                        <TableCell>{item.total}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            <TabelaDetalhamento colunas={dados.colunas} linhas={dados.linhas} />
        </div>
    );
}

export default GraficoReservasPeriodo;
