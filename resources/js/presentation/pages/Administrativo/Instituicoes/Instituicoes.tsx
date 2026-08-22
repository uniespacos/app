import DeleteItem from '@/presentation/molecules/delete-item';
import GenericHeader from '@/presentation/molecules/generic-header';
import Paginacao from '@/presentation/molecules/paginacao-listas';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/presentation/templates/app-layout';
import { Instituicao } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { FilePenLine, PlusCircle, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { SearchFilter } from '@/presentation/molecules/SearchFilter';
const breadcrumbs = [
    {
        title: 'Gerenciar Instituições',
        href: '/institucional/instituicoes',
    },
];

export default function InstituicoesPage() {
    const { instituicoes } = usePage<{
        instituicoes: {
            data: Instituicao[];
            links: { url: string | null; label: string; active: boolean }[];
            meta: object;
        };
    }>().props;
    const [removerInstituicao, setRemoverInstituicao] = useState<Instituicao | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const filteredInstituicoes = useMemo(
        () =>
            instituicoes.data.filter(
                (instituicao) =>
                    instituicao.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    instituicao.sigla.toLowerCase().includes(searchTerm.toLowerCase()),
            ),
        [instituicoes.data, searchTerm],
    );
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Instituições" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="container mx-auto space-y-6 py-6">
                    <div className="container mx-auto space-y-6 p-6">
                        <GenericHeader
                            titulo="Gerenciar Instituições"
                            descricao="Aqui você consegue gerenciar as instituicoes cadastradas"
                            buttonText="Criar Nova"
                            buttonLink={route('institucional.instituicoes.create')}
                            ButtonIcon={PlusCircle}
                            canSeeButton={true}
                        />
                        <SearchFilter
                            searchTerm={searchTerm}
                            onSearchTermChange={setSearchTerm}
                            placeholder="Buscar por nome ou sigla"
                            variant="card"
                        />
                        <Card>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nome</TableHead>
                                            <TableHead>Sigla</TableHead>
                                            <TableHead>Endereço</TableHead>
                                            <TableHead className="w-[120px]">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredInstituicoes.map((instituicao: Instituicao) => {
                                            return (
                                                <TableRow key={instituicao.id}>
                                                    <TableCell>{instituicao.nome}</TableCell>
                                                    <TableCell>{instituicao.sigla}</TableCell>
                                                    <TableCell>{instituicao.endereco || 'N/A'}</TableCell>
                                                    <TableCell className="flex items-center gap-2">
                                                        <Link href={route('institucional.instituicoes.edit', { instituico: instituicao.id })}>
                                                            <Button variant="outline" size="icon">
                                                                <FilePenLine className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button variant="destructive" size="icon" onClick={() => setRemoverInstituicao(instituicao)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                                <Paginacao links={instituicoes.links} />
                            </CardContent>
                        </Card>
                        {removerInstituicao && (
                            <DeleteItem
                                isOpen={(open) => {
                                    if (!open) {
                                        setRemoverInstituicao(null);
                                    }
                                }}
                                itemName={removerInstituicao?.nome || 'Instituição'}
                                route={route('institucional.instituicoes.destroy', removerInstituicao.id)}
                            />
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
