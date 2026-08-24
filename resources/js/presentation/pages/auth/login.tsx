import { Head, router, useForm } from '@inertiajs/react';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLogoIcon from '@/presentation/atoms/app-logo-icon';

interface LoginForm {
    email: string;
    password: string;
    remember: boolean;
}

export default function Login() {
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: false,
    });
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => {
                reset('password');
            },
        });
    };

    return (
        <div className="bg-muted/50 flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
            <Head title="Entrar" />
            <div className="w-full max-w-md">
                <Card className="w-full">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-center text-2xl font-bold">
                            <div className="mb-2 flex justify-center">
                                <AppLogoIcon className="text-foreground size-34" />
                            </div>
                            Bem-vindo ao UniEspaços
                        </CardTitle>
                        <CardDescription className="text-muted-foreground text-center">
                            Entre com suas credenciais para acessar sua conta
                        </CardDescription>
                    </CardHeader>

                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="seu@email.com"
                                    value={data.email}
                                    onChange={(e) => {
                                        setData('email', e.target.value);
                                    }}
                                    className={errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}
                                    disabled={processing}
                                />
                                {errors.email && <p className="text-destructive mt-1 text-sm">{errors.email}</p>}
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Senha</Label>
                                    <button
                                        type="button"
                                        className="text-primary text-sm hover:underline"
                                        onClick={() => {
                                            router.get(route('password.request'));
                                        }}
                                    >
                                        Esqueceu a senha?
                                    </button>
                                </div>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="********"
                                        value={data.password}
                                        onChange={(e) => {
                                            setData('password', e.target.value);
                                        }}
                                        className={errors.password ? 'border-destructive focus-visible:ring-destructive pr-10' : 'pr-10'}
                                        disabled={processing}
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                                        onClick={() => {
                                            setShowPassword(!showPassword);
                                        }}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="text-muted-foreground h-4 w-4" />
                                        ) : (
                                            <Eye className="text-muted-foreground h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                {errors.password && <p className="text-destructive mt-1 text-sm">{errors.password}</p>}
                            </div>

                            <div className="flex items-center space-x-2 py-4">
                                <Checkbox
                                    id="remember"
                                    checked={data.remember}
                                    onCheckedChange={(checked) => {
                                        setData('remember', !!checked);
                                    }}
                                    disabled={processing}
                                />
                                <Label htmlFor="remember" className="cursor-pointer text-sm font-normal select-none">
                                    Lembrar-me
                                </Label>
                            </div>
                        </CardContent>

                        <CardFooter className="flex flex-col space-y-4">
                            <Button type="submit" className="w-full" disabled={processing}>
                                {processing ? (
                                    <>
                                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                        Entrando...
                                    </>
                                ) : (
                                    'Entrar'
                                )}
                            </Button>

                            <div className="text-muted-foreground text-center text-sm">
                                Não tem uma conta?{' '}
                                <button
                                    type="button"
                                    className="text-primary font-medium hover:underline"
                                    onClick={() => {
                                        router.get(route('register'));
                                    }}
                                >
                                    Cadastre-se!
                                </button>
                            </div>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
}
