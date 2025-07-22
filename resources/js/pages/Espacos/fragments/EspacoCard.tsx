import espacoImage from '@/assets/espaco.png';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import { Espaco } from '@/types';
import { router } from '@inertiajs/react';
import { Building2, Calendar, Edit, Heart, MapPin, Users } from 'lucide-react';
import { useState } from 'react';

type CardEspacoProps = {
    espaco: Espaco;
    userType: number;
    isGerenciarEspacos?: boolean;
    handleSolicitarReserva?: (espacoId: string) => void;
    handleEditarEspaco?: (espacoId: string) => void;
    handleExcluirEspaco?: (espacoId: string) => void;
};

export default function EspacoCard({
    espaco,
    userType,
    isGerenciarEspacos,
    handleSolicitarReserva,
    handleEditarEspaco,
    handleExcluirEspaco,
}: CardEspacoProps) {
    const [isFavorited, setIsFavorited] = useState<boolean>(espaco.is_favorited_by_user ?? false);
    const [processing, setProcessing] = useState(false);

    const handleFavoritarEspaco = () => {
        setProcessing(true);
        if (isFavorited) {
            router.delete(route('espacos.desfavoritar', espaco.id), {
                preserveState: true, // Mantém o estado dos filtros na página
                preserveScroll: true, // Não rola a página para o topo
                replace: true,
                onSuccess: () => {
                    router.reload();
                    setIsFavorited(false); // Atualiza o estado local para refletir a mudança
                },
                onFinish: () => {
                    setProcessing(false); // Reseta o estado de processamento após a ação
                },
            });
        } else {
            router.post(
                route('espacos.favoritar', espaco.id),
                {},
                {
                    preserveScroll: true, // Não rola a página para o topo
                    preserveState: true, // Mantém o estado dos filtros na página
                    replace: true,
                    onSuccess: () => {
                        router.reload();
                        setIsFavorited(true); // Atualiza o estado local para refletir a mudança
                    },
                    onFinish: () => {
                        setProcessing(false); // Reseta o estado de processamento após a ação
                    },
                },
            );
        }
    };
    return (
        <Card className="overflow-hidden">
            <CardHeader className="relative">
                {/* Adicione 'relative' aqui para posicionar o botão */}
                <Carousel>
                    <CarouselContent>
                        {espaco.imagens ? espaco.imagens.map((img, index) => (
                            <CarouselItem key={index}>
                                <div>
                                    <img
                                        src={espaco.main_image_index ? `/storage/${img}` : espacoImage}
                                        alt={espaco.nome}
                                        className="h-40 w-full object-cover"
                                    />
                                </div>
                            </CarouselItem>
                        )) : <div className="p-1">
                            <img
                                src={espaco.main_image_index ? `/storage/${espaco.main_image_index}` : espacoImage}
                                alt={espaco.nome}
                                className="h-40 w-full object-cover"
                            />
                        </div>}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>

                <button
                    onClick={handleFavoritarEspaco}
                    disabled={processing} // Desabilita o botão enquanto processa
                    // Posiciona o botão no canto superior direito da imagem
                    className={`absolute top-2 right-2 rounded-full p-2 shadow-md transition-colors duration-200 ${isFavorited ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-white text-gray-700 hover:bg-gray-100'} ${processing ? 'cursor-not-allowed opacity-70' : ''} `}
                    title={isFavorited ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
                >
                    <Heart className={`h-5 w-5 ${isFavorited ? 'fill-current text-white' : 'text-gray-500'}`} />
                </button>
            </CardHeader>
            <CardContent >
                <div className="mb-2 flex items-start justify-between">
                    <CardTitle className="text-xl">Espaço: {espaco.nome}</CardTitle>
                </div>
                <div className="espaco-y-2 mt-4">
                    <div className="mb-3 flex flex-col gap-2">
                        <Badge variant="outline" className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {espaco.andar?.modulo?.nome}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {espaco.andar?.nome}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {espaco.capacidade_pessoas} pessoas
                        </Badge>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="flex flex-wrap gap-2 pt-0">
                {isGerenciarEspacos && userType === 1 ? (
                    <>
                        <Button variant="outline" size="sm" onClick={() => { }}>
                            <Edit className="mr-2 h-4 w-4" />
                            Ver Detalhes
                        </Button>
                        <Button variant="default" size="sm" onClick={() => handleEditarEspaco?.(espaco.id.toString())}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar Espaço
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleExcluirEspaco?.(espaco.id.toString())}>
                            <Edit className="mr-2 h-4 w-4" />
                            Excluir
                        </Button>
                    </>
                ) : (
                    <Button variant="default" size="sm" onClick={() => handleSolicitarReserva?.(espaco.id.toString())}>
                        <Calendar className="mr-2 h-4 w-4" />
                        Ver agenda
                    </Button>
                )}
            </CardFooter>
        </Card >
    );
}
