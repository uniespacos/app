import { Head, Link, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { SyntheticEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/i18n';
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
    const { t } = useTranslation();
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
        <AuthLayout
            title={t('auth.resetPassword.title')}
            description={t('auth.resetPassword.subtitle')}
            maxWidth="md"
        >
            <Head title={t('auth.resetPassword.head_title')} />

            <form onSubmit={submit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">{t('auth.resetPassword.email')}</Label>
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
                    <Label htmlFor="password">{t('auth.resetPassword.password')}</Label>
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
                        placeholder={t('auth.resetPassword.password_placeholder')}
                        className={errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}
                        disabled={processing}
                    />
                    <InputError message={errors.password} />
                    <PasswordStrengthMeter password={data.password} className="mt-2" />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password_confirmation">{t('auth.resetPassword.password_confirmation')}</Label>
                    <Input
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        autoComplete="new-password"
                        value={data.password_confirmation}
                        onChange={(e) => {
                            setData('password_confirmation', e.target.value);
                        }}
                        placeholder={t('auth.resetPassword.password_confirmation_placeholder')}
                        className={errors.password_confirmation ? 'border-destructive focus-visible:ring-destructive' : ''}
                        disabled={processing}
                    />
                    <InputError message={errors.password_confirmation} />
                </div>

                <Button type="submit" className="h-11 w-full text-base font-medium" disabled={processing}>
                    {processing ? (
                        <>
                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                            {t('auth.resetPassword.submitting')}
                        </>
                    ) : (
                        t('auth.resetPassword.submit')
                    )}
                </Button>

                <div className="border-border text-muted-foreground border-t pt-4 text-center text-sm">
                    {t('auth.resetPassword.remembered_password')}{' '}
                    <Link href={route('login')} className="text-primary font-medium underline-offset-4 hover:underline">
                        {t('auth.resetPassword.back_to_login')}
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
}
