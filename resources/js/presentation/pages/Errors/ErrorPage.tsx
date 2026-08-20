import { Button } from '@/components/ui/button';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Clock, Lock, SearchX, ServerCrash, TriangleAlert } from 'lucide-react';
import { ComponentType } from 'react';

interface ErrorPageProps {
    status: number;
}

interface ErrorContent {
    titulo: string;
    descricao: string;
    Icone: ComponentType<{ className?: string }>;
}

const CONTEUDO_POR_STATUS: Record<number, ErrorContent> = {
    403: {
        titulo: 'Acesso não autorizado',
        // Cobre os dois casos que geram 403 na prática após a issue #119:
        // reserva de outro usuário e reserva que já saiu do estado editável.
        descricao:
            'Você não tem permissão para acessar este conteúdo. Se você tentava editar uma reserva, é possível que ela já tenha sido avaliada e não possa mais ser alterada.',
        Icone: Lock,
    },
    404: {
        titulo: 'Página não encontrada',
        descricao: 'O endereço acessado não existe ou o item que você procura foi removido.',
        Icone: SearchX,
    },
    419: {
        titulo: 'Sessão expirada',
        descricao: 'Sua sessão expirou por inatividade. Atualize a página e entre novamente para continuar.',
        Icone: Clock,
    },
    500: {
        titulo: 'Erro interno do servidor',
        descricao: 'Algo deu errado do nosso lado. A equipe técnica foi notificada. Tente novamente em alguns instantes.',
        Icone: ServerCrash,
    },
    503: {
        titulo: 'Serviço em manutenção',
        descricao: 'O sistema está temporariamente indisponível para manutenção. Tente novamente em alguns minutos.',
        Icone: TriangleAlert,
    },
};

const CONTEUDO_PADRAO: ErrorContent = {
    titulo: 'Ocorreu um erro',
    descricao: 'Não foi possível concluir sua solicitação. Tente novamente em alguns instantes.',
    Icone: TriangleAlert,
};

export default function ErrorPage({ status }: ErrorPageProps) {
    const { titulo, descricao, Icone } = CONTEUDO_POR_STATUS[status] ?? CONTEUDO_PADRAO;

    return (
        <>
            <Head title={titulo} />

            <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 py-12 text-center">
                <div className="bg-muted flex h-16 w-16 items-center justify-center rounded-full">
                    <Icone className="text-muted-foreground h-8 w-8" />
                </div>

                <div className="space-y-2">
                    <p className="text-muted-foreground text-sm font-medium tracking-widest">ERRO {status}</p>
                    <h1 className="text-2xl font-semibold tracking-tight">{titulo}</h1>
                    <p className="text-muted-foreground mx-auto max-w-md text-sm">{descricao}</p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2">
                    <Button variant="outline" onClick={() => window.history.back()}>
                        <ArrowLeft className="mr-1 h-4 w-4" /> Voltar
                    </Button>
                    <Button onClick={() => router.get(route('dashboard'))}>Ir para o painel</Button>
                </div>
            </div>
        </>
    );
}
