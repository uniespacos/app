import AppLayout from '@/layouts/app-layout';
import { Instituicao } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import InstituicaoForm from './fragments/InstituicaoForm';
import { useAgnosticForm } from '@/hooks/use-agnostic-form';

export interface EditarInstituicaoForm extends Record<string, unknown> {
    nome: string;
    sigla: string;
    endereco: string;
}

declare function route(name: string, params?: unknown): string;

export default function EditarInstituicao() {
    const { instituicao } = usePage<{ instituicao: Instituicao }>().props;
    const breadcrumbs = [
        {
            title: 'Gerenciar Instituicões',
            href: '/institucional/instituicao',
        },
        {
            title: 'Editar Instituicao',
            href: `/institucional/instituicao/${instituicao.id}/edit`,
        },
    ];
    const form = useAgnosticForm<EditarInstituicaoForm>({
        nome: instituicao.nome,
        sigla: instituicao.sigla,
        endereco: instituicao.endereco,
    });

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        form.submit('put', route('institucional.instituicoes.update', { instituico: instituicao.id }));
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
                        errors={form.errors as Record<string, string>}
                        processing={form.processing}
                        title="Editar Instituição"
                        description="Altere os dados da instituição abaixo."
                    />
                </div>
            </div>
        </AppLayout>
    );
}
