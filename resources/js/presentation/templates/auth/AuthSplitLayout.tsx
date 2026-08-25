import AppLogoIcon from '@/presentation/atoms/AppLogoIcon';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { CalendarCheck, ShieldCheck, Sparkles } from 'lucide-react';
import { type PropsWithChildren } from 'react';
import { cn } from '@/lib/utils';

interface AuthLayoutProps {
    title?: string;
    description?: string;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export default function AuthSplitLayout({ children, title, description, maxWidth = 'md' }: PropsWithChildren<AuthLayoutProps>) {
    const { name, quote } = usePage<SharedData>().props;

    const maxWidthClass = {
        sm: 'sm:max-w-sm',
        md: 'sm:max-w-md',
        lg: 'sm:max-w-lg',
        xl: 'sm:max-w-xl',
        '2xl': 'sm:max-w-2xl',
    }[maxWidth];

    return (
        <div className="bg-background relative grid min-h-dvh flex-col items-stretch justify-center lg:max-w-none lg:grid-cols-12">
            {/* Coluna Institucional UESB (Desktop) */}
            <div className="bg-brand-blue-darkest dark:border-border relative hidden h-full flex-col justify-between overflow-hidden p-10 text-white lg:col-span-5 lg:flex xl:col-span-4 dark:border-r">
                {/* Efeito de iluminação suave em degradê */}
                <div className="from-primary/20 pointer-events-none absolute inset-0 bg-gradient-to-b via-transparent to-black/40" />
                <div className="bg-primary/15 pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full blur-3xl" />
                <div className="bg-info/10 pointer-events-none absolute -right-24 -bottom-24 h-96 w-96 rounded-full blur-3xl" />

                {/* Topo / Logo */}
                <div className="relative z-20">
                    <Link href={route('home')} className="flex items-center gap-3 transition-opacity hover:opacity-90">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-white/10 p-2 shadow-inner ring-1 ring-white/20 backdrop-blur-md">
                            <AppLogoIcon className="size-full fill-current text-white" />
                        </div>
                        <div>
                            <span className="text-xl font-bold tracking-tight text-white">{name ?? 'UniEspaços'}</span>
                            <span className="block text-[11px] font-medium tracking-wide text-white/70 uppercase">UESB • Gestão Integrada</span>
                        </div>
                    </Link>
                </div>

                {/* Bloco Central com Destaques da Plataforma */}
                <div className="relative z-20 my-auto space-y-6 py-8">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/90 ring-1 ring-white/20 backdrop-blur-md">
                            <Sparkles className="text-warning size-3.5" />
                            <span>Ambiente Acadêmico Conectado</span>
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight text-white xl:text-3xl">Reserva e Gestão Inteligente de Espaços</h2>
                        <p className="text-sm leading-relaxed text-white/80">
                            Agilize a solicitação e o acompanhamento de salas, auditórios, laboratórios e quadras em todos os campi da UESB.
                        </p>
                    </div>

                    <div className="space-y-3 rounded-xl bg-white/5 p-4 ring-1 ring-white/10 backdrop-blur-sm">
                        <div className="flex items-start gap-3 text-xs text-white/90">
                            <CalendarCheck className="text-success mt-0.5 size-4 shrink-0" />
                            <span>Grade de horários em tempo real e sem conflitos.</span>
                        </div>
                        <div className="flex items-start gap-3 text-xs text-white/90">
                            <ShieldCheck className="text-info mt-0.5 size-4 shrink-0" />
                            <span>Validação institucional e autorização descentralizada.</span>
                        </div>
                    </div>
                </div>

                {/* Rodapé / Citação */}
                <div className="relative z-20 mt-auto border-t border-white/10 pt-6">
                    <blockquote className="space-y-1.5">
                        <p className="text-sm leading-relaxed text-white/90 italic">
                            &ldquo;{quote?.message ?? 'A educação não transforma o mundo. Educação muda as pessoas. Pessoas transformam o mundo.'}
                            &rdquo;
                        </p>
                        <footer className="text-xs font-medium text-white/60">— {quote?.author ?? 'Paulo Freire'}</footer>
                    </blockquote>
                </div>
            </div>

            {/* Coluna do Formulário */}
            <div className="flex flex-col justify-center overflow-y-auto px-6 py-10 sm:px-10 lg:col-span-7 lg:px-12 xl:col-span-8">
                <div className={cn('mx-auto flex w-full flex-col justify-center space-y-6', maxWidthClass)}>
                    {/* Header para Mobile */}
                    <div className="flex flex-col items-center justify-center gap-2 lg:hidden">
                        <Link href={route('home')} className="flex items-center gap-2.5">
                            <div className="bg-primary/10 text-primary ring-primary/20 flex size-11 items-center justify-center rounded-xl p-2 ring-1">
                                <AppLogoIcon className="text-primary size-full fill-current" />
                            </div>
                            <div className="text-left">
                                <span className="text-foreground text-lg font-bold tracking-tight">{name ?? 'UniEspaços'}</span>
                                <span className="text-muted-foreground block text-[10px] font-medium uppercase">UESB</span>
                            </div>
                        </Link>
                    </div>

                    {/* Cabeçalho da Tela */}
                    {(title ?? description) && (
                        <div className="flex flex-col space-y-1.5 text-center sm:text-left">
                            {title && <h1 className="text-foreground text-2xl font-bold tracking-tight">{title}</h1>}
                            {description && <p className="text-muted-foreground text-sm text-balance">{description}</p>}
                        </div>
                    )}

                    {/* Conteúdo do Formulário */}
                    {children}
                </div>
            </div>
        </div>
    );
}
