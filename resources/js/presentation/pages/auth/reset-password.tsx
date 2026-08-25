import { Head, Link, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { SyntheticEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/presentation/atoms/InputError';
import { PasswordStrengthMeter } from '@/presentation/molecules/PasswordStrengthMeter';
import AuthLayout from '@/presentation/templates/AuthLayout';

interface ResetPasswordProps {
    token: string;
    email: string;
}

interface ResetPasswordForm {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
}

export default function ResetPassword({ token, email }: ResetPasswordProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<ResetPasswordForm>>({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit = (e: SyntheticEvent) => {
        e.preventDefault();
        post(route('password.update'), {
            onFinish: () => {
                reset('password', 'password_confirmation');
            },
        });
    };

    return (
        <AuthLayout title="Redefinição de Senha" description="Informe sua nova senha para restaurar o acesso à plataforma" maxWidth="md">
            <Head title="Redefinição de senha" />

            <form onSubmit={submit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                        id="email"
                        type="email"
                        name="email"
                        autoComplete="email"
                        value={data.email}
                        readOnly
                        disabled
                        className="bg-muted text-muted-foreground"
                    />
                    <InputError message={errors.email} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password">Nova Senha</Label>
                    <Input
                        id="password"
                        type="password"
                        name="password"
                        autoComplete="new-password"
                        value={data.password}
                        autoFocus
                        onChange={(e) => {
                            setData('password', e.target.value);
                        }}
                        placeholder="Digite sua nova senha"
                        className={errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}
                        disabled={processing}
                    />
                    <InputError message={errors.password} />
                    <PasswordStrengthMeter password={data.password} className="mt-2" />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password_confirmation">Confirmar Nova Senha</Label>
                    <Input
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        autoComplete="new-password"
                        value={data.password_confirmation}
                        onChange={(e) => {
                            setData('password_confirmation', e.target.value);
                        }}
                        placeholder="Confirme sua nova senha"
                        className={errors.password_confirmation ? 'border-destructive focus-visible:ring-destructive' : ''}
                        disabled={processing}
                    />
                    <InputError message={errors.password_confirmation} />
                </div>

                <Button type="submit" className="h-11 w-full text-base font-medium" disabled={processing}>
                    {processing ? (
                        <>
                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                            Redefinindo senha...
                        </>
                    ) : (
                        'Salvar Nova Senha'
                    )}
                </Button>

                <div className="border-border text-muted-foreground border-t pt-4 text-center text-sm">
                    Lembrou da senha antiga?{' '}
                    <Link href={route('login')} className="text-primary font-medium underline-offset-4 hover:underline">
                        Voltar para o login
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
}
