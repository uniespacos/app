import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Login" />
            <div className="bg-background flex min-h-screen items-center justify-center">
                <div className="bg-card grid w-full max-w-6xl grid-cols-1 overflow-hidden rounded-xl shadow-2xl md:grid-cols-2">
                    {/* Lado esquerdo - Formulário */}
                    <div className="flex flex-col justify-center p-10">
                        <h1 className="mb-6 text-3xl font-bold">Login</h1>
                        <form className="space-y-6" onSubmit={submit}>
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    autoFocus
                                    autoComplete="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="login@gmail.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                    {canResetPassword && (
                                        <TextLink href={route('password.request')} className="text-sm">
                                            Esqueceu a senha?
                                        </TextLink>
                                    )}
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    autoComplete="current-password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="********"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox id="remember" name="remember" checked={data.remember} onClick={() => setData('remember', !data.remember)} />
                                <Label htmlFor="remember">Lembrar-me</Label>
                            </div>

                            <Button type="submit" className="w-full" disabled={processing}>
                                {processing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : 'LOGIN'}
                            </Button>

                            <div className="text-muted-foreground text-center text-sm">ou continuar com</div>

                            <div className="text-center text-sm">
                                Ainda não tem uma conta?{' '}
                                <TextLink href={route('register')} className="text-primary">
                                    Inscreva-se gratuitamente
                                </TextLink>
                            </div>
                        </form>

                        {status && <div className="mt-4 text-center text-sm text-green-600">{status}</div>}
                    </div>

                    {/* Lado direito - Imagem e logo */}
                    <div className="relative hidden flex-col items-center justify-center bg-[#e0f1f9] p-8 md:flex">
                        <img src="/_img/uesb_reservas_logo.png" alt="Logo UESB Reservas" className="mx-auto mb-3 w-52" />

                        <div className="relative">
                            <img src="/_img/ForCharacter.png" alt="Personagem" className="mb-2 w-64" />
                            <img src="/_img/cactus.png" alt="Cacto" className="absolute right-0 bottom-0 w-16" />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
