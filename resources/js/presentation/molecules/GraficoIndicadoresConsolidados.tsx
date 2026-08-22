import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from 'recharts';
import { Building, CalendarCheck, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import { DadosRelatorio } from '@/types';

interface Props {
    dados: DadosRelatorio;
}

const CORES = [
    'var(--chart-1)',
    'var(--chart-2)',
    'var(--chart-3)',
    'var(--chart-4)',
    'var(--chart-5)',
];

const situacoesConfig = {
    total: {
        label: 'Reservas',
        color: 'var(--chart-1)',
    },
} satisfies ChartConfig;

function numero(valor: unknown): number {
    return Number(valor ?? 0);
}

function GraficoIndicadoresConsolidados({ dados }: Props) {
    if (dados.linhas.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{dados.titulo}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-sm">
                        Nenhum indicador para os filtros selecionados.
                    </p>
                </CardContent>
            </Card>
        );
    }

    const situacoes = dados.linhas
        .filter((linha) => String(linha.metrica ?? '').startsWith('Reservas '))
        .map((linha) => ({
            situacao: String(linha.metrica).replace('Reservas ', ''),
            total: numero(linha.valor),
        }));

    const inicioTopEspacos = dados.linhas.findIndex(
        (linha) => linha.metrica === '— Top 5 Espaços —'
    );
    const inicioTopSetores = dados.linhas.findIndex(
        (linha) => linha.metrica === '— Top 5 Setores —'
    );

    const topEspacos =
        inicioTopEspacos === -1
            ? []
            : dados.linhas
                  .slice(
                      inicioTopEspacos + 1,
                      inicioTopSetores === -1 ? undefined : inicioTopSetores
                  )
                  .map((linha) => ({
                      nome: String(linha.metrica ?? ''),
                      count: numero(linha.valor),
                  }));

    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Espaços</CardTitle>
                        <Building className="text-muted-foreground h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {numero(dados.sumario['Total de Espaços'])}
                        </div>
                        <p className="text-muted-foreground text-xs">Espaços cadastrados</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Gestores</CardTitle>
                        <Users className="text-muted-foreground h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {numero(dados.sumario['Total de Gestores'])}
                        </div>
                        <p className="text-muted-foreground text-xs">Gestores delegados</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Reservas</CardTitle>
                        <CalendarCheck className="text-muted-foreground h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {numero(dados.sumario['Total de Reservas'])}
                        </div>
                        <p className="text-muted-foreground text-xs">Total de reservas</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Distribuição de Situações</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer
                            config={situacoesConfig}
                            className="aspect-auto h-[260px] w-full"
                        >
                            <BarChart accessibilityLayer data={situacoes}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="situacao" tickLine={false} axisLine={false} />
                                <YAxis />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Bar
                                    dataKey="total"
                                    fill="var(--color-total)"
                                    radius={4}
                                    maxBarSize={64}
                                />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Top 5 Espaços</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {(() => {
                            const chartConfig = topEspacos.reduce<ChartConfig>((acc, e, i) => {
                                acc[e.nome] = { label: e.nome, color: CORES[i % CORES.length] };
                                return acc;
                            }, {});
                            return (
                                <ChartContainer
                                    config={chartConfig}
                                    className="aspect-auto h-[260px] w-full"
                                >
                                    <PieChart accessibilityLayer>
                                        <ChartTooltip content={<ChartTooltipContent nameKey="nome" />} />
                                        <Pie
                                            data={topEspacos}
                                            dataKey="count"
                                            nameKey="nome"
                                            innerRadius={60}
                                        >
                                            {topEspacos.map((espaco, index) => (
                                                <Cell key={espaco.nome} fill={CORES[index % CORES.length]} />
                                            ))}
                                        </Pie>
                                        <ChartLegend content={<ChartLegendContent nameKey="nome" />} />
                                    </PieChart>
                                </ChartContainer>
                            );
                        })()}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default GraficoIndicadoresConsolidados;
