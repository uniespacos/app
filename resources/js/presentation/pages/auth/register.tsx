import { Button } from '@/components/ui/button';
import { ModalNovaInstituicao } from '@/presentation/molecules/ModalNovaInstituicao';
import { FormRegistroUsuario } from '@/presentation/organisms/FormRegistroUsuario';
import { Instituicao } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';

export default function Register() {
    const { instituicaos } = usePage<{ instituicaos: Instituicao[] }>().props;

    const [showModal, setShowModal] = useState(false);
    const [novaInstituicao, setNovaInstituicao] = useState({
        nome: '',
        unidade: '',
        setor: '',
    });

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        campus: '',
        instituicao_id: '',
        setor_id: '',
        instituicao_custom: '',
        unidade_custom: '',
        setor_custom: '',
    });
    const handleInputChange = (field: string, value: string) => {
        setData((prev) => ({ ...prev, [field]: value }));
    };

    const handleNovaInstituicaoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNovaInstituicao((prev) => ({ ...prev, [name]: value }));
    };

    const submitNovaInstituicao = () => {
        setData((prev) => ({
            ...prev,
            instituicao_custom: novaInstituicao.nome,
            unidade_custom: novaInstituicao.unidade,
            setor_custom: novaInstituicao.setor,
        }));
        setShowModal(false);
        setNovaInstituicao({ nome: '', unidade: '', setor: '' });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => {
                reset('password', 'password_confirmation');
            },
        });
    };

    const handleBackToLogin = () => {
        router.get(route('login'));
    };

    return (
        // Sem gradiente semântico equivalente no tema; usa fundo neutro que respeita dark mode.
        <div className="bg-muted flex min-h-screen items-center justify-center">
            <Head title="Criar conta" />
            <div className="container mx-auto px-4 py-8">
                <div className="mx-auto max-w-6xl">
                    <div className="grid items-center gap-8 lg:grid-cols-2">
                        <div className="flex flex-col items-center justify-center">
                            <div className="text-center">
                                <img src="/_img/uniespacos_logo.png" alt="Logo UniEspaços" className="h-100 w-auto" />
                                <p className="text-muted-foreground text-lg">Crie sua conta para começar a usar nossa plataforma</p>
                            </div>
                        </div>

                        <div className="bg-card rounded-2xl p-8 shadow-xl">
                            <div className="mb-8">
                                <h2 className="text-foreground mb-2 text-2xl font-semibold">Criar conta</h2>
                                <p className="text-muted-foreground">Preencha os dados abaixo para se cadastrar</p>
                            </div>

                            <FormRegistroUsuario
                                data={data}
                                onInputChange={handleInputChange}
                                errors={errors}
                                processing={processing}
                                instituicaos={instituicaos}
                                onSubmit={handleSubmit}
                            />

                            <div className="border-border mt-6 border-t pt-6">
                                <Button variant="outline" className="w-full bg-transparent" onClick={handleBackToLogin}>
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Voltar para o login
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ModalNovaInstituicao
                open={showModal}
                onOpenChange={setShowModal}
                novaInstituicao={novaInstituicao}
                onChange={handleNovaInstituicaoChange}
                onSubmit={submitNovaInstituicao}
            />
        </div>
    );
}
