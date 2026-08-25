import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { SyntheticEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/i18n';
import InputError from '@/presentation/atoms/InputError';
import TextLink from '@/presentation/atoms/TextLink';
import AuthLayout from '@/presentation/templates/AuthLayout';

export default function ForgotPassword({ status }: { status?: string }) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors } = useForm<Required<{ email: string }>>({
        email: '',
    });

    const submit = (e: SyntheticEvent) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <AuthLayout
            title={t('auth.forgotPassword.header_title')}
            description={t('auth.forgotPassword.header_desc')}
            maxWidth="md"
        >
            <Head title={t('auth.forgotPassword.head_title')} />

            {status && (
                <div className="bg-success-subtle text-success-accent border-success/20 rounded-lg border p-3 text-center text-sm font-medium">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">{t('auth.forgotPassword.email_institutional')}</Label>
                    <Input
                        id="email"
                        type="email"
                        name="email"
                        autoComplete="email"
                        value={data.email}
                        autoFocus
                        onChange={(e) => {
                            setData('email', e.target.value);
                        }}
                        placeholder={t('auth.forgotPassword.email_placeholder')}
                        className={errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}
                        disabled={processing}
                    />
                    <InputError message={errors.email} />
                </div>

                <Button type="submit" className="h-11 w-full text-base font-medium" disabled={processing}>
                    {processing ? (
                        <>
                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                            {t('auth.forgotPassword.sending')}
                        </>
                    ) : (
                        t('auth.forgotPassword.submit_button')
                    )}
                </Button>

                <div className="border-border text-muted-foreground border-t pt-4 text-center text-sm">
                    {t('auth.forgotPassword.remembered_password')}{' '}
                    <TextLink href={route('login')} className="text-primary font-medium">
                        {t('auth.forgotPassword.back_to_login')}
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
