import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { SyntheticEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/presentation/atoms/InputError';
import AuthLayout from '@/presentation/templates/AuthLayout';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm<Required<{ password: string }>>({
        password: '',
    });

    const submit = (e: SyntheticEvent) => {
        e.preventDefault();

        post(route('password.confirm'), {
            onFinish: () => {
                reset('password');
            },
        });
    };

    return (
        <AuthLayout
            title="Confirmar Senha"
            description="Esta é uma área segura da plataforma. Por favor, confirme sua senha antes de continuar."
            maxWidth="md"
        >
            <Head title="Confirmar senha" />

            <form onSubmit={submit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                        id="password"
                        type="password"
                        name="password"
                        placeholder="Digite sua senha de acesso"
                        autoComplete="current-password"
                        value={data.password}
                        autoFocus
                        onChange={(e) => {
                            setData('password', e.target.value);
                        }}
                        className={errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}
                        disabled={processing}
                    />
                    <InputError message={errors.password} />
                </div>

                <Button type="submit" className="h-11 w-full text-base font-medium" disabled={processing}>
                    {processing ? (
                        <>
                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                            Confirmando...
                        </>
                    ) : (
                        'Confirmar Senha'
                    )}
                </Button>
            </form>
        </AuthLayout>
    );
}
