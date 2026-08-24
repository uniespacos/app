/* eslint-disable @typescript-eslint/no-explicit-any */
import { validarEstrutura } from '@/lib/utils/andars/AndarHelpers';
import GenericHeader from '@/presentation/molecules/generic-header';
import { AndarFormData } from '@/presentation/organisms/AndarFormCard';
import ModuloForm from '@/presentation/organisms/ModuloForm';
import AppLayout from '@/presentation/templates/app-layout';
import { Instituicao, Unidade } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
const breadcrumbs = [
    {
        title: 'Gerenciar Modulos',
        href: '/institucional/modulo',
    },
    {
        title: 'Cadastrar Modulo',
        href: `/institucional/modulos/create`,
    },
];
export interface CadastrarModuloForm {
    nome: string;
    unidade_id: string;
    andares: AndarFormData[];
    [key: string]: any; // Para permitir outros campos dinâmicos
}

export default function CadastrarModuloPage() {
    const { instituicao, unidades } = usePage<{ instituicao: Instituicao; unidades: Unidade[] }>().props;

    const { data, setData, post, processing, errors } = useForm<CadastrarModuloForm>({
        nome: '',
        unidade_id: '',
        andares: [],
    });

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        let errors = false;
        const validacaoEstrutura = validarEstrutura(data.andares);
        if (!validacaoEstrutura.valido) {
            errors = true;
            toast.error(`Estrutura inválida: ${validacaoEstrutura.erros.join(', ')}`);
            return;
        }
        data.andares.forEach((andar) => {
            if (andar.tipo_acesso.length === 0) {
                errors = true;
            }
        });
        if (errors) {
            toast.error('Todos os andares devem ter pelo menos um tipo de acesso definido.');
            return;
        }
        post(route('institucional.modulos.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Criar Modulo" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="container mx-auto space-y-6 py-6">
                    <div className="container mx-auto space-y-6 p-6">
                        <GenericHeader titulo="Cadastrar Modulo" descricao="Preencha os dados abaixo para cadastrar um novo modulo." />
                        <ModuloForm
                            data={data}
                            setData={setData}
                            submit={submit}
                            errors={errors}
                            processing={processing}
                            title="Criar Novo Módulo"
                            description="Preencha os dados abaixo para cadastrar um novo modulo."
                            instituicao={instituicao}
                            unidades={unidades}
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
