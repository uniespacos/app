import GenericHeader from '@/presentation/molecules/generic-header';
import EspacoCard from '@/presentation/organisms/EspacoCard'; // Caminho ajustado para o seu EspacoCard
import AppLayout from '@/presentation/templates/app-layout';
import { Espaco, User } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';

const breadcrumbs = [
    {
        title: 'Meus Favoritos',
        href: '/espacos/favoritos',
    },
];

export default function FavoritosPage() {
    // Desestruturamos as props que vêm do controller Laravel
    const {
        favoritos: { data: espacosFavoritos, links }, // Renomeamos 'data' para 'espacosFavoritos' para clareza
        user,
    } = usePage<{
        favoritos: {
            data: Espaco[];
            links: { url: string | null; label: string; active: boolean }[];
            meta: object;
        };
        user: User;
    }>().props;

    // Função para solicitar reserva (mantida igual à página de Espaços)
    const handleSolicitarReserva = (espacoId: string) => {
        router.get(`/espacos/${espacoId}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Meus Favoritos" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="container mx-auto space-y-6 py-6">
                    <div className="container mx-auto space-y-6 p-6">
                        <GenericHeader
                            titulo="Meus Espaços Favoritos"
                            descricao="Aqui você encontra todos os espaços que você marcou como favoritos."
                        />

                        {/* Exibe os cards dos espaços favoritados */}
                        {espacosFavoritos.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                                {espacosFavoritos.map((espaco) => (
                                    <EspacoCard key={espaco.id} espaco={espaco} user={user} handleSolicitarReserva={handleSolicitarReserva} />
                                ))}
                            </div>
                        ) : (
                            <div className="py-10 text-center text-gray-500">
                                <p>Você ainda não favoritou nenhum espaço. Explore e adicione seus favoritos!</p>
                                <Link href={route('espacos.index')} className="mt-4 block text-blue-500 hover:underline">
                                    Ver todos os espaços
                                </Link>
                            </div>
                        )}

                        {/* Componente de Paginação */}
                        {espacosFavoritos.length > 0 && (
                            <div className="mt-6 flex justify-center">
                                <div className="flex gap-1">
                                    {links.map((link, index) =>
                                        link.url ? (
                                            <Link
                                                key={index}
                                                href={link.url}
                                                className={`rounded-md border px-4 py-2 text-sm ${link.active ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-accent'}`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ) : (
                                            <span
                                                key={index}
                                                className="text-muted-foreground rounded-md border px-4 py-2 text-sm"
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ),
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
