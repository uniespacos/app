import GenericHeader from '@/presentation/molecules/generic-header';
import AppLayout from '@/presentation/templates/app-layout';
import { Head } from '@inertiajs/react';
import { PlusCircle } from 'lucide-react';
import InstituicaoForm from '@/presentation/organisms/InstituicaoForm';
import { useAgnosticForm } from '@/hooks/use-agnostic-form';

const breadcrumbs = [
    {
        title: 'Gerenciar Instituicão',
        href: '/institucional/instituicao',
    },
    {
        title: 'Cadastrar Instituicão',
        href: `/institucional/instituicao/create`,
    },
];

export interface CadastrarInstituicaoForm extends Record<string, unknown> {
    nome: string;
    sigla: string;
    endereco: string;
}

declare function route(name: string, params?: unknown): string;

export default function CadastrarInstituicaoPage() {
    const form = useAgnosticForm<CadastrarInstituicaoForm>({
        nome: '',
        sigla: '',
        endereco: '',
    });

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        form.submit('post', route('institucional.instituicoes.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Criar Instituição" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="container mx-auto space-y-6 py-6">
                    <div className="container mx-auto space-y-6 p-6">
                        <GenericHeader
                            titulo="Cadastrar Instituição"
                            descricao="Preencha os dados abaixo para cadastrar uma nova instituição."
                            buttonText="Cadastrar instituição"
                            buttonLink={route('institucional.instituicoes.create')}
                            ButtonIcon={PlusCircle}
                        />
                        <InstituicaoForm
                            data={form.data}
                            setData={form.setData}
                            submit={submit}
                            errors={form.errors as Record<string, string>}
                            processing={form.processing}
                            title="Criar Nova Instituição"
                            description="Preencha os dados abaixo para cadastrar uma nova instituição."
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
