import GenericHeader from '@/presentation/molecules/generic-header';
import UnidadeForm from '@/presentation/organisms/UnidadesForm';
import AppLayout from '@/presentation/templates/app-layout';
import { Instituicao, Unidade } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';

export interface EditarUnidadeForm {
    nome: string;
    sigla: string;
    instituicao_id: string;
    [key: string]: string;
}

export default function EditarUnidade() {
    const { instituicao, unidade } = usePage<{ instituicao: Instituicao; unidade: Unidade }>().props;
    const breadcrumbs = [
        {
            title: 'Gerenciar Unidades',
            href: '/institucional/unidades',
        },
        {
            title: 'Editar Unidade',
            href: `/institucional/unidades/${unidade.id}/edit`,
        },
    ];
    const { data, setData, put, processing, errors } = useForm<EditarUnidadeForm>({
        nome: unidade.nome,
        sigla: unidade.sigla,
        instituicao_id: unidade.instituicao?.id.toString() || '',
    });

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        put(route('institucional.unidades.update', { unidade: unidade.id }));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar ${unidade.nome}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="container mx-auto space-y-6 py-6">
                    <div className="container mx-auto space-y-6 p-6">
                        <GenericHeader titulo={`Editar Unidade:  ${unidade.nome}`} descricao="Aqui você consegue editar a unidade selecionada" />
                        <UnidadeForm
                            data={data}
                            setData={setData}
                            submit={submit}
                            errors={errors}
                            processing={processing}
                            title="Editar Modulo"
                            description="Altere os dados do modulo abaixo."
                            instituicao={instituicao}
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
