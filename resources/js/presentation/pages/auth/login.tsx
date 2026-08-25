import { Head, Link, useForm } from '@inertiajs/react';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { SyntheticEvent, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/presentation/atoms/InputError';
import TextLink from '@/presentation/atoms/TextLink';
import AuthLayout from '@/presentation/templates/AuthLayout';

interface LoginForm {
    email: string;
    password: string;
    remember: boolean;
}

interface LoginProps {
    status?: string;
    canResetPassword?: boolean;
}

export default function Login({ status, canResetPassword = true }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: false,
    });
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e: SyntheticEvent) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => {
                reset('password');
            },
        });
    };

    return (
        <AuthLayout title="Acessar UniEspaços" description="Informe seu e-mail e senha para gerenciar ou reservar espaços" maxWidth="md">
            <Head title="Entrar" />

            {status && (
                <div className="bg-success-subtle text-success-accent border-success/20 rounded-lg border p-3 text-center text-sm font-medium">
                    {status}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">E-mail Institucional</Label>
                    <Input
                        id="email"
                        type="email"
                        name="email"
                        autoComplete="username"
                        placeholder="seu@uesb.edu.br"
                        value={data.email}
                        autoFocus
                        onChange={(e) => {
                            setData('email', e.target.value);
                        }}
                        className={errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}
                        disabled={processing}
                    />
                    <InputError message={errors.email} />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password">Senha</Label>
                        {canResetPassword && (
                            <TextLink href={route('password.request')} className="text-muted-foreground hover:text-primary text-xs">
                                Esqueceu a senha?
                            </TextLink>
                        )}
                    </div>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            autoComplete="current-password"
                            placeholder="Sua senha de acesso"
                            value={data.password}
                            onChange={(e) => {
                                setData('password', e.target.value);
                            }}
                            className={errors.password ? 'border-destructive focus-visible:ring-destructive pr-10' : 'pr-10'}
                            disabled={processing}
                        />
                        <button
                            type="button"
                            aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                            className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex items-center pr-3"
                            onClick={() => {
                                setShowPassword(!showPassword);
                            }}
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                    <InputError message={errors.password} />
                </div>

                <div className="flex items-center space-x-2 py-1">
                    <Checkbox
                        id="remember"
                        checked={data.remember}
                        onCheckedChange={(checked) => {
                            setData('remember', !!checked);
                        }}
                        disabled={processing}
                    />
                    <Label htmlFor="remember" className="text-muted-foreground cursor-pointer text-sm font-normal select-none">
                        Lembrar meus dados neste dispositivo
                    </Label>
                </div>

                <Button type="submit" className="h-11 w-full text-base font-medium" disabled={processing}>
                    {processing ? (
                        <>
                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                            Entrando...
                        </>
                    ) : (
                        'Entrar no Sistema'
                    )}
                </Button>

                <div className="border-border text-muted-foreground border-t pt-4 text-center text-sm">
                    Ainda não possui cadastro?{' '}
                    <Link href={route('register')} className="text-primary font-medium underline-offset-4 hover:underline">
                        Criar uma nova conta
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
}
