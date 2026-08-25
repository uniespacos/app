import { ModalNovaInstituicao } from '@/presentation/organisms/ModalNovaInstituicao';
import { FormRegistroUsuario } from '@/presentation/organisms/FormRegistroUsuario';
import AuthLayout from '@/presentation/templates/AuthLayout';
import { Instituicao } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type React from 'react';

export default function Register() {
    const { instituicaos } = usePage<{ instituicaos: Instituicao[] }>().props;
    const [showModal, setShowModal] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        campus: '',
        instituicao_id: '',
        setor_id: '',
    });

    const handleInputChange = (field: string, value: string) => {
        setData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.SyntheticEvent) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => {
                reset('password', 'password_confirmation');
            },
        });
    };

    return (
        <AuthLayout
            title="Criar Conta Institucional"
            description="Preencha as informações abaixo para solicitar seu acesso ao UniEspaços"
            maxWidth="2xl"
        >
            <Head title="Criar conta" />

            <FormRegistroUsuario
                data={data}
                onInputChange={handleInputChange}
                errors={errors}
                processing={processing}
                instituicaos={instituicaos}
                onSubmit={handleSubmit}
            />

            <div className="border-border text-muted-foreground border-t pt-4 text-center text-sm">
                Já possui uma conta institucional?{' '}
                <Link href={route('login')} className="text-primary font-medium underline-offset-4 hover:underline">
                    Fazer login
                </Link>
            </div>

            <ModalNovaInstituicao open={showModal} onOpenChange={setShowModal} />
        </AuthLayout>
    );
}
