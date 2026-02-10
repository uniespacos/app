import EspacoCard from '@/pages/Espacos/fragments/EspacoCard';
import { Espaco, User } from '@/types';
import { router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';

export default function TabsItemEspacosFavoritos({
    espacosFiltrados,
    searchTerm,
    setSearchTerm,
    user,
}: {
    user: User;
    espacosFiltrados: Espaco[];
    searchTerm: string;
    setSearchTerm: (term: string) => void;
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Espaços Favoritos</CardTitle>
                <CardDescription>Seus espaços marcados como favoritos</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="mb-4">
                    <div className="relative">
                        <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
                        <Input
                            placeholder="Buscar espaços favoritos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {espacosFiltrados.map((espaco) => (
                        <EspacoCard
                            key={espaco.id}
                            espaco={espaco}
                            userType={user.permission_type_id}
                            handleSolicitarReserva={() => router.get(`/espacos/${espaco.id}`)}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
