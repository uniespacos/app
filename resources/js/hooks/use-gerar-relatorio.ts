import { FiltrosRelatorio, FormatoRelatorio, TipoRelatorio } from '@/types';
import { useState } from 'react';
import { toast } from 'sonner';

interface PayloadGerarRelatorio {
    tipo: TipoRelatorio;
    formato: FormatoRelatorio;
    filtros?: FiltrosRelatorio;
}

export function useGerarRelatorio(endpoint: string) {
    const [estaGerando, setEstaGerando] = useState(false);

    const gerar = async (payload: PayloadGerarRelatorio) => {
        setEstaGerando(true);

        try {
            const metaToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
            const xsrfCookie = decodeURIComponent(
                document.cookie
                    .split('; ')
                    .find((r) => r.startsWith('XSRF-TOKEN='))
                    ?.split('=')[1] ?? '',
            );

            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                Accept: 'application/pdf, text/csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            };

            if (xsrfCookie) {
                headers['X-XSRF-TOKEN'] = xsrfCookie;
            } else if (metaToken) {
                headers['X-CSRF-TOKEN'] = metaToken;
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                credentials: 'same-origin',
                headers,
                body: JSON.stringify({
                    tipo: payload.tipo,
                    formato: payload.formato,
                    ...payload.filtros,
                }),
            });

            if (!response.ok) {
                if (response.status === 422) {
                    try {
                        const data = await response.json();
                        toast.error(data.message || 'Erro ao gerar relatório.');
                    } catch {
                        toast.error('Erro ao gerar relatório.');
                    }
                } else {
                    toast.error('Erro ao gerar relatório.');
                }
                return;
            }

            const blob = await response.blob();

            const contentDisposition = response.headers.get('content-disposition');
            let filename = `relatorio.${payload.formato}`;

            if (contentDisposition) {
                const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(contentDisposition);
                if (match && match[1]) {
                    filename = decodeURIComponent(match[1].trim());
                }
            }

            const url = URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = filename;
            document.body.appendChild(anchor);
            anchor.click();
            document.body.removeChild(anchor);
            URL.revokeObjectURL(url);

            toast.success('Relatório gerado com sucesso.');
        } finally {
            setEstaGerando(false);
        }
    };

    return { gerar, estaGerando };
}
