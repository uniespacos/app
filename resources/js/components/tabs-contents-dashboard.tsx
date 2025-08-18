import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Espaco, Reserva, User } from "@/types";
import { useEffect, useState } from "react";
import { TabsProps } from "@radix-ui/react-tabs";
import TabsItemReserva from "./tabs-item-reserva";
import TabsItemEspacosFavoritos from "./tabs-item-espacos-favoritos";

export type TabsItens = {
    tabHeader: {
        value: string;
        textDescription: string;
    };
    tabContent: {
        title: string;
        description: string;
    }
}

type TabsContentDashboardProps = {
    reservas: Reserva[];
    espacosFavoritos: Espaco[];
    user: User;
    defaultValue?: string;
    itens: TabsItens[];
} & TabsProps;

export default function TabsContentDashboard({ reservas, espacosFavoritos, user, defaultValue, itens, ...props }: TabsContentDashboardProps) {
    const [filteredEspacosFavoritos, setFilteredEspacosFavoritos] = useState<Espaco[]>(espacosFavoritos);
    const [searchTerm, setSearchTerm] = useState<string>('');
    useEffect(() => {
        if (!searchTerm) {
            setFilteredEspacosFavoritos(espacosFavoritos);
            return;
        }

        const lowerSearchTerm = searchTerm.toLowerCase();
        const filtered = espacosFavoritos.filter((espaco) =>
            espaco.nome.toLowerCase().includes(lowerSearchTerm) ||
            (espaco.andar?.nome?.toLowerCase().includes(lowerSearchTerm) || '') ||
            (espaco.andar?.modulo?.nome?.toLowerCase().includes(lowerSearchTerm) || '')
        );

        setFilteredEspacosFavoritos(filtered);
    }, [espacosFavoritos, searchTerm]);

    return (
        <Tabs {...props} defaultValue={defaultValue || "reservas"} className="space-y-4">
            <TabsList>
                {itens.map((item) =>
                    <TabsTrigger key={item.tabHeader.value} value={item.tabHeader.value}>{item.tabHeader.textDescription}</TabsTrigger>
                )}
            </TabsList>

            <TabsContent value="reservas" className="space-y-4">
                <TabsItemReserva reservas={reservas} />
            </TabsContent>

            <TabsContent value="favoritos" className="space-y-4">
                <TabsItemEspacosFavoritos espacosFiltrados={filteredEspacosFavoritos} user={user} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            </TabsContent>
        </Tabs>
    );
}