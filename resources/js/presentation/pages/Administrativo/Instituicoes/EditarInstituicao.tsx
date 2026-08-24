import InstituicaoForm from '@/presentation/organisms/InstituicaoForm';
import AppLayout from '@/presentation/templates/app-layout';
import { Instituicao } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import type React from 'react';

export interface EditarInstituicaoForm {
    nome: string;
    sigla: string;
    endereco: string;
}

export default function EditarInstituicao() {
    const { instituicao } = usePage<{ instituicao: Instituicao }>().props;
    const breadcrumbs = [
        {
            title: 'Gerenciar Instituicões',
            href: '/institucional/instituicoes',
        },
        {
            title: 'Editar Instituicao',
            href: `/institucional/instituicoes/${instituicao.id}/edit`,
        },
    ];

    const form = useForm({
        nome: instituicao.nome,
        sigla: instituicao.sigla,
        endereco: instituicao.endereco,
    });

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        form.put(route('institucional.instituicoes.update', { instituico: instituicao.id }));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar ${instituicao.nome}`} />
            <div className="container mx-auto py-10">
                <div className="container mx-auto space-y-6 p-6">
                    <InstituicaoForm
                        data={form.data}
                        setData={form.setData}
                        submit={submit}
                        errors={form.errors}
                        processing={form.processing}
                        title="Editar Instituição"
                        description="Altere os dados da instituição abaixo."
                    />
                </div>
            </div>
        </AppLayout>
    );
}
