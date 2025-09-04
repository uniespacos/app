import GenericHeader from '@/components/generic-header';
import AppLayout from '@/layouts/app-layout';
import { Andar, Espaco, FiltrosEspacosType, Modulo, Unidade, User } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { PlusCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { FiltrosEspacos } from './fragments/FiltrosEspacos';
import { GerenciarGestoresDialog } from './fragments/GerenciarGestoresDialog';
import { Paginacao } from './fragments/Paginacao';
import { TabelaEspacos } from './fragments/TabelaEspacos';
const breadcrumbs = [
    {
        title: 'Gerenciar Espaços',
        href: '/institucional/espacos',
    },
];
export default function GerenciarEspacos() {
    const {
        unidades,
        modulos,
        andares,
        espacos, // Agora é um array completo, não um objeto paginado
        users,
    } = usePage<{
        espacos: Espaco[];
        unidades: Unidade[];
        modulos: Modulo[];
        andares: Andar[];
        users: User[];
    }>().props;

    // Estado para os filtros, inicializado como vazio
    const [filtros, setFiltros] = useState<FiltrosEspacosType>({
        search: '',
        unidade: undefined,
        modulo: undefined,
        andar: undefined,
        capacidade: '',
    });
    const [espacoParaGerenciar, setEspacoParaGerenciar] = useState<Espaco | null>(null);
    const { data, setData, patch, error } = useForm<{ espacoId: number | null; gestores: Record<string, number | null> }>({
        espacoId: null,
        gestores: {},
    });
    // Estado para a paginação
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; // Defina quantos itens por página

    // Lógica de filtragem que roda no frontend
    const espacosFiltrados = useMemo(() => {
        let espacosFiltradosTemp = [...espacos];

        // 1. Filtro de busca por nome
        if (filtros.search) {
            espacosFiltradosTemp = espacosFiltradosTemp.filter((espaco) => espaco.nome.toLowerCase().includes(filtros.search.toLowerCase()));
        }

        // 2. Filtro por capacidade mínima
        if (filtros.capacidade) {
            espacosFiltradosTemp = espacosFiltradosTemp.filter((espaco) => espaco.capacidade_pessoas >= Number(filtros.capacidade));
        }

        // 3. Filtros de localização (Unidade, Módulo, Andar)
        if (filtros.unidade) {
            espacosFiltradosTemp = espacosFiltradosTemp.filter((espaco) => espaco.andar?.modulo?.unidade?.id.toString() === filtros.unidade);
        }
        if (filtros.modulo) {
            espacosFiltradosTemp = espacosFiltradosTemp.filter((espaco) => espaco.andar?.modulo?.id.toString() === filtros.modulo);
        }
        if (filtros.andar) {
            espacosFiltradosTemp = espacosFiltradosTemp.filter((espaco) => espaco.andar?.id.toString() === filtros.andar);
        }

        return espacosFiltradosTemp;
    }, [espacos, filtros]);

    // Quando os filtros mudam, resetamos para a primeira página
    useEffect(() => {
        setCurrentPage(1);
    }, [filtros]);

    // Lógica de paginação
    const espacosPaginados = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return espacosFiltrados.slice(startIndex, startIndex + itemsPerPage);
    }, [currentPage, espacosFiltrados, itemsPerPage]);

    const handleCadastrarEspaco = () => {
        router.get(route('institucional.espacos.create'));
    };
    const handleGerenciarGestores = (espaco: Espaco) => {
        setEspacoParaGerenciar(espaco);
    };

    const handleSalvarGestores = (espacoId: number, gestores: Record<string, number | null>) => {
        router.patch(route('institucional.espacos.alterarGestores', espacoId), { gestores: gestores });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gerenciar Espaços" />
            <div className="flex">
                <div className="flex-1 w-[100vh] container mx-auto space-y-6 py-6">
                    <div className="container mx-auto space-y-6 p-6">
                        {/* Cabeçalho */}
                        <GenericHeader
                            titulo={'Gerenciar Espaços'}
                            descricao={'Gerencie todos os espaços disponíveis, seus dados e gestores'}
                            buttonText="Cadastrar Espaço"
                            ButtonIcon={PlusCircle}
                            buttonOnClick={handleCadastrarEspaco}
                            canSeeButton // Exibe o botão apenas para
                        />

                        {/* Filtros */}
                        <FiltrosEspacos filtros={filtros} setFiltros={setFiltros} unidades={unidades} modulos={modulos} andares={andares} />

                        {/* Tabela de Espaços */}
                        {!espacoParaGerenciar ? (
                            <TabelaEspacos
                                key={currentPage} // Força a re-renderização da tabela ao mudar de página
                                espacos={espacosPaginados}
                                onGerenciarGestores={handleGerenciarGestores}
                                totalFiltrado={espacosFiltrados.length}
                            />
                        ) : (
                            <GerenciarGestoresDialog
                                key={espacoParaGerenciar?.id}
                                espaco={espacoParaGerenciar}
                                usuarios={users}
                                isOpen={!!espacoParaGerenciar}
                                onClose={() => setEspacoParaGerenciar(null)}
                                onSave={handleSalvarGestores}
                            />
                        )}

                        <Paginacao
                            totalItems={espacosFiltrados.length}
                            itemsPerPage={itemsPerPage}
                            currentPage={currentPage}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
