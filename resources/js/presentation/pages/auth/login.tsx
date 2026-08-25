import { Head, Link, useForm } from '@inertiajs/react';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { SyntheticEvent, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/i18n';
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
    const { t } = useTranslation();
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
        <AuthLayout
            title={t('auth.login.header_title')}
            description={t('auth.login.header_desc')}
            maxWidth="md"
        >
            <Head title={t('auth.login.head_title')} />

            {status && (
                <div className="bg-success-subtle text-success-accent border-success/20 rounded-lg border p-3 text-center text-sm font-medium">
                    {status}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">{t('auth.login.email_institutional')}</Label>
                    <Input
                        id="email"
                        type="email"
                        name="email"
                        autoComplete="username"
                        placeholder={t('auth.login.email_placeholder')}
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
                        <Label htmlFor="password">{t('auth.login.password_label')}</Label>
                        {canResetPassword && (
                            <TextLink href={route('password.request')} className="text-muted-foreground hover:text-primary text-xs">
                                {t('auth.login.forgotPassword')}
                            </TextLink>
                        )}
                    </div>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            autoComplete="current-password"
                            placeholder={t('auth.login.password_placeholder')}
                            value={data.password}
                            onChange={(e) => {
                                setData('password', e.target.value);
                            }}
                            className={errors.password ? 'border-destructive focus-visible:ring-destructive pr-10' : 'pr-10'}
                            disabled={processing}
                        />
                        <button
                            type="button"
                            aria-label={showPassword ? t('auth.login.hide_password') : t('auth.login.show_password')}
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
                        {t('auth.login.remember_device')}
                    </Label>
                </div>

                <Button type="submit" className="h-11 w-full text-base font-medium" disabled={processing}>
                    {processing ? (
                        <>
                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                            {t('auth.login.entering')}
                        </>
                    ) : (
                        t('auth.login.submit_system')
                    )}
                </Button>

                <div className="border-border text-muted-foreground border-t pt-4 text-center text-sm">
                    {t('auth.login.no_account_text')}{' '}
                    <Link href={route('register')} className="text-primary font-medium underline-offset-4 hover:underline">
                        {t('auth.login.create_account')}
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
}
