import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { SyntheticEvent } from 'react';

import { Button } from '@/components/ui/button';
import { useTranslation } from '@/i18n';
import TextLink from '@/presentation/atoms/TextLink';
import AuthLayout from '@/presentation/templates/AuthLayout';

export default function VerifyEmail({ status }: { status?: string }) {
    const { t } = useTranslation();
    const { post, processing } = useForm({});

    const submit = (e: SyntheticEvent) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <AuthLayout
            title={t('auth.verifyEmail.title')}
            description={t('auth.verifyEmail.subtitle')}
            maxWidth="md"
        >
            <Head title={t('auth.verifyEmail.head_title')} />

            {status === 'verification-link-sent' && (
                <div className="bg-success-subtle text-success-accent border-success/20 mb-4 rounded-lg border p-3 text-center text-sm font-medium">
                    {t('auth.verifyEmail.sent_message')}
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <Button disabled={processing} className="h-11 w-full text-base font-medium">
                    {processing ? (
                        <>
                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                            {t('auth.verifyEmail.resending')}
                        </>
                    ) : (
                        t('auth.verifyEmail.resend_button')
                    )}
                </Button>

                <div className="border-border text-muted-foreground border-t pt-4 text-center text-sm">
                    <TextLink href={route('logout')} method="post" className="text-destructive font-medium hover:underline">
                        {t('auth.verifyEmail.logout_link')}
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
