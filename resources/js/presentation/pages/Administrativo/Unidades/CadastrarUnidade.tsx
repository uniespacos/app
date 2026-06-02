import GenericHeader from '@/components/generic-header';
import AppLayout from '@/presentation/templates/app-layout';
import { Instituicao } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import UnidadeForm from './fragments/UnidadesForm';
const breadcrumbs = [
    {
        title: 'Gerenciar Unidades',
        href: '/institucional/unidades',
    },
    {
        title: 'Cadastrar Unidade',
        href: '/institucional/unidades/create',
    },
];

export interface CadastrarUnidadeForm {
    nome: string;
    sigla: string;
    instituicao_id: string;
    [key: string]: string; // Permite campos adicionais
}

export default function CadastrarUnidadePage() {
    const { instituicao } = usePage<{ instituicao: Instituicao }>().props;
    const { data, setData, post, processing, errors } = useForm<CadastrarUnidadeForm>();

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        setData((prevData) => ({ ...prevData, instituicao_id: instituicao.id.toString() }));

        e.preventDefault();

        post(route('institucional.unidades.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Criar Unidade" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="container mx-auto space-y-6 py-6">
                    <div className="container mx-auto space-y-6 p-6">
                        <GenericHeader titulo="Cadastrar Unidade" descricao="Preencha os dados abaixo para cadastrar uma nova unidade." />
                        <UnidadeForm
                            data={data}
                            setData={setData}
                            submit={submit}
                            errors={errors}
                            processing={processing}
                            title="Criar Novo Módulo"
                            description="Preencha os dados abaixo para cadastrar um novo modulo."
                            instituicao={instituicao}
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
