import { TriangleAlert } from 'lucide-react';

export interface ChamadosAbertos {
    total: number;
    categorias: { label: string; total: number }[];
}

/**
 * Aviso informativo exibido a quem está prestes a reservar um espaço que tem
 * problemas reportados em aberto. Não bloqueia a reserva — a decisão continua
 * sendo de quem reserva.
 */
export default function ChamadosAbertosAlerta({ chamadosAbertos }: { chamadosAbertos?: ChamadosAbertos }) {
    if (!chamadosAbertos || chamadosAbertos.total === 0) {
        return null;
    }

    const { total, categorias } = chamadosAbertos;
    const plural = total > 1;

    return (
        <div
            role="status"
            className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100"
        >
            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="min-w-0 space-y-1">
                <p className="font-medium">
                    {total} problema{plural ? 's' : ''} reportado{plural ? 's' : ''} neste espaço
                </p>
                {categorias.length > 0 && (
                    <p className="text-sm">
                        {categorias.map((categoria, indice) => (
                            <span key={categoria.label}>
                                {indice > 0 && ' · '}
                                {categoria.label}
                                {categoria.total > 1 && ` (${categoria.total})`}
                            </span>
                        ))}
                    </p>
                )}
                <p className="text-sm opacity-90">
                    A gestão do espaço já foi avisada. Você pode reservar normalmente — este é apenas um aviso.
                </p>
            </div>
        </div>
    );
}
