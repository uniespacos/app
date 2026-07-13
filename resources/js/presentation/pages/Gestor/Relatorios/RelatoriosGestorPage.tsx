import { useState } from 'react';
import AppLayout from '@/presentation/templates/app-layout';
import GenericHeader from '@/presentation/molecules/generic-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FiltrosReservasPeriodo } from '@/presentation/molecules/FiltrosReservasPeriodo';
import { FiltrosOcupacaoEspacos } from '@/presentation/molecules/FiltrosOcupacaoEspacos';
import { FiltrosInventarioEspacos } from '@/presentation/molecules/FiltrosInventarioEspacos';
import { useGerarRelatorio } from '@/hooks/use-gerar-relatorio';
import { FormatoRelatorio, FiltrosRelatorio, TipoRelatorio, TipoRelatorioOption } from '@/types';

interface Props {
    tipos_disponiveis: TipoRelatorioOption[];
}

export default function RelatoriosGestorPage({ tipos_disponiveis }: Props) {
    const [tipoSelecionado, setTipoSelecionado] = useState<TipoRelatorio | undefined>();
    const [formatoSelecionado, setFormatoSelecionado] = useState<FormatoRelatorio>('pdf');
    const [filtros, setFiltros] = useState<Partial<FiltrosRelatorio>>({});

    const { gerar, estaGerando } = useGerarRelatorio('/gestor/relatorios/gerar');

    const handleGerar = async () => {
        if (!tipoSelecionado) return;

        await gerar({
            tipo: tipoSelecionado,
            formato: formatoSelecionado,
            filtros,
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Relatórios', href: '/gestor/relatorios' }]}>
            <GenericHeader
                titulo="Relatórios"
                descricao="Gere relatórios operacionais dos espaços que você gerencia."
            />

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Configurar Relatório</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <Label htmlFor="tipo" className="mb-2 block">
                            Tipo de Relatório
                        </Label>
                        <Select value={tipoSelecionado} onValueChange={(value) => setTipoSelecionado(value as TipoRelatorio)}>
                            <SelectTrigger id="tipo">
                                <SelectValue placeholder="Selecione um tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                {tipos_disponiveis.map((tipo) => (
                                    <SelectItem key={tipo.value} value={tipo.value}>
                                        {tipo.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {tipoSelecionado && (
                        <div>
                            <Label className="mb-4 block">Filtros</Label>
                            {tipoSelecionado === 'reservas_periodo' && (
                                <FiltrosReservasPeriodo filtros={filtros} onChange={setFiltros} />
                            )}
                            {tipoSelecionado === 'ocupacao_espacos' && (
                                <FiltrosOcupacaoEspacos filtros={filtros} onChange={setFiltros} />
                            )}
                            {tipoSelecionado === 'inventario_espacos' && (
                                <FiltrosInventarioEspacos filtros={filtros} onChange={setFiltros} />
                            )}
                        </div>
                    )}

                    <div>
                        <Label htmlFor="formato" className="mb-2 block">
                            Formato
                        </Label>
                        <Select value={formatoSelecionado} onValueChange={(value) => setFormatoSelecionado(value as FormatoRelatorio)}>
                            <SelectTrigger id="formato">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pdf">PDF</SelectItem>
                                <SelectItem value="csv">CSV</SelectItem>
                                <SelectItem value="xlsx">XLSX</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        onClick={handleGerar}
                        disabled={!tipoSelecionado || estaGerando}
                        className="w-full"
                    >
                        {estaGerando ? 'Gerando...' : 'Gerar Relatório'}
                    </Button>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
