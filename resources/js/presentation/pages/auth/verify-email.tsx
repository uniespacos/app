import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { SyntheticEvent } from 'react';

import { Button } from '@/components/ui/button';
import TextLink from '@/presentation/atoms/TextLink';
import AuthLayout from '@/presentation/templates/AuthLayout';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    const submit = (e: SyntheticEvent) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <AuthLayout
            title="Verificação de E-mail"
            description="Por favor, verifique seu endereço de e-mail clicando no link que acabamos de enviar para sua caixa de entrada."
            maxWidth="md"
        >
            <Head title="Verificação de e-mail" />

            {status === 'verification-link-sent' && (
                <div className="bg-success-subtle text-success-accent border-success/20 mb-4 rounded-lg border p-3 text-center text-sm font-medium">
                    Um novo link de verificação foi enviado para o seu endereço de e-mail institucional.
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <Button disabled={processing} className="h-11 w-full text-base font-medium">
                    {processing ? (
                        <>
                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                            Enviando...
                        </>
                    ) : (
                        'Reenviar E-mail de Verificação'
                    )}
                </Button>

                <div className="border-border text-muted-foreground border-t pt-4 text-center text-sm">
                    <TextLink href={route('logout')} method="post" className="text-destructive font-medium hover:underline">
                        Encerrar sessão / Sair
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
