import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import EspacoCard from '@/pages/Espacos/fragments/EspacoCard';
import { Espaco, User } from '@/types';
import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function TabsItemEspacosGerenciados({ espacos, user }: { espacos: Espaco[], user: User }) {
    const [filteredEspacos, setFilteredEspacos] = useState<Espaco[]>(espacos);
    const [searchTerm, setSearchTerm] = useState<string>('');

    useEffect(() => {
        if (!searchTerm) {
            setFilteredEspacos(espacos);
            return;
        }

        const lowerSearchTerm = searchTerm.toLowerCase();
        const filtered = espacos.filter((espaco) =>
            espaco.nome.toLowerCase().includes(lowerSearchTerm) ||
            (espaco.andar?.nome?.toLowerCase().includes(lowerSearchTerm) || '') ||
            (espaco.andar?.modulo?.nome?.toLowerCase().includes(lowerSearchTerm) || '')
        );

        setFilteredEspacos(filtered);
    }, [espacos, searchTerm]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Espaços Sob Sua Gestão</CardTitle>
                <CardDescription>Espaços que você gerencia por turno</CardDescription>
                <Input
                    placeholder="Buscar espaço..."
                    className="max-w-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredEspacos?.map((espaco) => (
                        <EspacoCard showFavoritar={false} key={espaco?.id} espaco={espaco} userType={user.permission_type_id} handleSolicitarReserva={() => router.get(route("espacos.show", espaco.id))} />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
