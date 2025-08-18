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
import { Building2, Calendar, Edit, Heart, MapPin, Trash2, Users } from 'lucide-react';
import { useState } from 'react';

type CardEspacoProps = {
    espaco: Espaco;
    userType: number;
    isGerenciarEspacos?: boolean;
    handleSolicitarReserva?: (espacoId: string) => void;
    handleEditarEspaco?: (espacoId: string) => void;
    handleExcluirEspaco?: (espacoId: string) => void;
    showFavoritar?: boolean; // Se deve mostrar o botão de favoritar
};

export default function EspacoCard({
    espaco,
    userType,
    isGerenciarEspacos,
    handleSolicitarReserva,
    handleEditarEspaco,
    handleExcluirEspaco,
    showFavoritar = true,
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
    const imageSources = (espaco.imagens && espaco.imagens.length > 0)
        ? espaco.imagens.map(img => `/storage/${img}`) // Assumindo que '/storage/' é o caminho correto
        : [espaco.main_image_index ? `/storage/${espaco.main_image_index}` : espacoImage];

    return (
        // Adicionado 'flex flex-col' para que o conteúdo possa crescer e o rodapé ficar alinhado na base
        <Card className="flex flex-col overflow-hidden h-full">
            {/* --- Seção da Imagem/Carrossel --- */}
            {/* O container da imagem agora é um 'div' separado com posicionamento relativo */}
            <div className="relative">
                <Carousel className="w-full">
                    <CarouselContent>
                        {imageSources.map((src, index) => (
                            <CarouselItem key={index}>
                                <div className="aspect-video"> {/* Proporção 16:9 para consistência */}
                                    <img
                                        src={src}
                                        alt={`Imagem ${index + 1} de ${espaco.nome}`}
                                        className="h-full w-full object-cover"
                                        onError={(e) => { e.currentTarget.src = espacoImage; }} // Fallback para imagem quebrada
                                    />
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    {/* Mostra os botões de navegação apenas se houver mais de uma imagem */}
                    {imageSources.length > 1 && (
                        <>
                            <CarouselPrevious className="absolute left-3 top-1/2 -translate-y-1/2" />
                            <CarouselNext className="absolute right-3 top-1/2 -translate-y-1/2" />
                        </>
                    )}
                </Carousel>

                {/* Botão de Favoritar posicionado sobre a imagem */}
                {showFavoritar && <button
                    onClick={handleFavoritarEspaco}
                    disabled={processing}
                    className={`absolute top-2 right-2 rounded-full p-2 shadow-md transition-all duration-200 ${isFavorited ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-white text-gray-700 hover:bg-gray-100'} ${processing ? 'cursor-not-allowed opacity-70' : ''}`}
                    title={isFavorited ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
                >
                    <Heart className={`h-5 w-5 ${isFavorited ? 'fill-current' : ''}`} />
                </button>}
            </div>

            {/* O CardHeader agora contém apenas o título, como é o padrão */}
            <CardHeader>
                <CardTitle className="text-xl truncate" title={espaco.nome}>
                    {espaco.nome}
                </CardTitle>
            </CardHeader>

            {/* Adicionado 'flex-grow' para que esta área ocupe o espaço disponível, empurrando o rodapé para baixo */}
            <CardContent className="flex-grow">
                <div className="grid grid-cols-2 gap-2">
                    <Badge variant="outline" className="flex items-center gap-1.5 truncate">
                        <Building2 className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{espaco.andar?.modulo?.nome ?? 'N/A'}</span>
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1.5 truncate">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{espaco.andar?.nome ?? 'N/A'}</span>
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1.5 truncate">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{espaco.andar?.modulo?.unidade?.nome ?? 'N/A'}</span>
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1.5 truncate">
                        <Users className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{espaco.capacidade_pessoas} pessoas</span>
                    </Badge>
                </div>
            </CardContent>

            {/* O rodapé se alinha na parte inferior do card */}
            <CardFooter className="flex flex-wrap gap-2 pt-4">
                {isGerenciarEspacos && userType === 1 ? (
                    <>
                        <Button variant="outline" size="sm" onClick={() => { /* Lógica para ver detalhes */ }}>
                            Ver Detalhes
                        </Button>
                        <Button variant="default" size="sm" onClick={() => handleEditarEspaco?.(String(espaco.id))}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleExcluirEspaco?.(String(espaco.id))}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                        </Button>
                    </>
                ) : (
                    <Button className="w-full" variant="default" size="sm" onClick={() => handleSolicitarReserva?.(String(espaco.id))}>
                        <Calendar className="mr-2 h-4 w-4" />
                        Ver agenda
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
