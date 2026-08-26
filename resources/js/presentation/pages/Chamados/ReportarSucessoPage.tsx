import { Head } from '@inertiajs/react';
import { CheckCircle2, MapPin } from 'lucide-react';

interface ChamadoSucesso {
    protocolo: string;
    tipo: string | null;
    categoria: string | null;
    status: string;
    criado_em: string | null;
    tem_contato: boolean;
    espaco: string | null;
    localizacao: string | null;
}

export default function ReportarSucessoPage({ chamado }: { chamado: ChamadoSucesso }) {
    return (
        <div className="bg-background flex min-h-svh flex-col items-center justify-center p-4 md:p-10">
            <Head title="Registro enviado" />

            <div className="w-full max-w-lg space-y-6">
                <header className="space-y-3 text-center">
                    <CheckCircle2 className="mx-auto h-12 w-12 text-green-600 dark:text-green-500" />
                    <h1 className="text-2xl font-semibold">Registro enviado</h1>
                    <p className="text-muted-foreground text-sm">
                        A gestão do espaço foi avisada. Obrigado por ajudar a manter o campus funcionando.
                    </p>
                </header>

                <div className="space-y-4 rounded-lg border p-4">
                    <div>
                        <p className="text-muted-foreground text-xs tracking-wide uppercase">Protocolo</p>
                        <p className="font-mono text-sm break-all">{chamado.protocolo}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 border-t pt-4">
                        <div>
                            <p className="text-muted-foreground text-xs tracking-wide uppercase">Tipo</p>
                            <p className="text-sm">{chamado.tipo ?? '—'}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-xs tracking-wide uppercase">Assunto</p>
                            <p className="text-sm">{chamado.categoria ?? '—'}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-xs tracking-wide uppercase">Situação</p>
                            <p className="text-sm">{chamado.status}</p>
                        </div>
                    </div>

                    {chamado.espaco && (
                        <div className="flex items-start gap-3 border-t pt-4">
                            <MapPin className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
                            <div className="min-w-0">
                                <p className="text-sm font-medium">{chamado.espaco}</p>
                                <p className="text-muted-foreground truncate text-sm">{chamado.localizacao}</p>
                            </div>
                        </div>
                    )}

                    {chamado.criado_em && <p className="text-muted-foreground border-t pt-4 text-sm">Registrado em {chamado.criado_em}</p>}
                </div>

                <p className="text-muted-foreground text-center text-sm">
                    {chamado.tem_contato
                        ? 'Você receberá um e-mail quando o chamado for encerrado.'
                        : 'Guarde o número do protocolo caso precise se referir a este registro.'}
                </p>
            </div>
        </div>
    );
}
