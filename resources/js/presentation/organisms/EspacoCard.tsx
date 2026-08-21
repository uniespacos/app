import espacoImage from '@/assets/espaco.png';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { hasPermission } from '@/lib/auth';
import { PERMISSION_ESPACOS_ATUALIZAR } from '@/constants/permissions';
import type { Espaco, User } from '@/types';
import { Building2, Calendar, Edit, Heart, MapPin, Trash2, Users } from 'lucide-react';

import { InertiaHttpGateway } from '@/infrastructure/shared/inertia-http-gateway';
import { InertiaEspacosRepository } from '@/infrastructure/espacos/inertia-espacos-repository';
import { useFavoritarEspacoUseCase } from '@/application/espacos/use-cases/use-favoritar-espaco-usecase';

const httpGateway = new InertiaHttpGateway();
const espacosRepository = new InertiaEspacosRepository(httpGateway);

type CardEspacoProps = {
    espaco: Espaco;
    user: User | null;
    isGerenciarEspacos?: boolean;
    handleSolicitarReserva?: (espacoId: string) => void;
    handleEditarEspaco?: (espacoId: string) => void;
    handleExcluirEspaco?: (espacoId: string) => void;
    showFavoritar?: boolean; // Se deve mostrar o botão de favoritar
};

export default function EspacoCard({
    espaco,
    user,
    isGerenciarEspacos,
    handleSolicitarReserva,
    handleEditarEspaco,
    handleExcluirEspaco,
    showFavoritar = true,
}: CardEspacoProps) {
    const { isFavorited, processing, toggleFavorito } = useFavoritarEspacoUseCase({
        repository: espacosRepository,
        espaco,
    });
    const modulo = espaco.andar?.modulo?.nome;
    const handleFavoritarEspaco = () => {
        toggleFavorito();
    };
    const imageSources =
        espaco.imagens && espaco.imagens.length > 0
            ? espaco.imagens.map((img) => `/storage/${img}`) // Assumindo que '/storage/' é o caminho correto
            : [espaco.main_image_index ? `/storage/${espaco.main_image_index}` : espacoImage];

    return (
        <Card className="flex flex-col overflow-hidden">
            {/* --- Seção da Imagem/Carrossel --- */}
            <div className="relative">
                <Carousel className="w-full">
                    <CarouselContent>
                        {imageSources.map((src, index) => (
                            <CarouselItem key={index}>
                                <div className="aspect-video">
                                    {' '}
                                    {/* Proporção 16:9 para consistência */}
                                    <img
                                        src={src}
                                        alt={`Imagem ${index + 1} de ${espaco.nome}`}
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                            e.currentTarget.src = espacoImage;
                                        }} // Fallback para imagem quebrada
                                    />
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    {/* Mostra os botões de navegação apenas se houver mais de uma imagem */}
                    {imageSources.length > 1 && (
                        <>
                            <CarouselPrevious className="absolute top-1/2 left-3 -translate-y-1/2" />
                            <CarouselNext className="absolute top-1/2 right-3 -translate-y-1/2" />
                        </>
                    )}
                </Carousel>

                {/* Botão de Favoritar posicionado sobre a imagem */}
                {showFavoritar && (
                    <button
                        onClick={handleFavoritarEspaco}
                        disabled={processing}
                        className={`absolute top-2 right-2 rounded-full p-2 shadow-md transition-all duration-200 ${isFavorited ? 'bg-destructive text-white hover:bg-destructive' : 'bg-background text-foreground hover:bg-muted'} ${processing ? 'cursor-not-allowed opacity-70' : ''}`}
                        title={isFavorited ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
                    >
                        <Heart className={`h-5 w-5 ${isFavorited ? 'fill-current' : ''}`} />
                    </button>
                )}
            </div>

            {/* O CardHeader agora contém apenas o título, como é o padrão */}
            <CardHeader>
                <CardTitle className="truncate text-xl" title={espaco.nome}>
                    {espaco.nome}
                </CardTitle>
            </CardHeader>

            {/* Adicionado 'flex-grow' para que esta área ocupe o espaço disponível, empurrando o rodapé para baixo */}
            <CardContent className="flex-grow">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-2">
                    <Badge variant="outline" className="flex h-auto items-start gap-1.5">
                        <Building2 className="h-4 w-4 flex-shrink-0" />
                        <span className="break-words whitespace-normal">{modulo ?? 'N/A'}</span>
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1.5 overflow-hidden">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span className="min-w-0 truncate">{espaco.andar?.nome ?? 'N/A'}</span>
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1.5 overflow-hidden">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span className="min-w-0 truncate">{espaco.andar?.modulo?.unidade?.sigla ?? 'N/A'}</span>
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1.5 overflow-hidden">
                        <Users className="h-4 w-4 flex-shrink-0" />
                        <span className="min-w-0 truncate">{espaco.capacidade_pessoas} pessoas</span>
                    </Badge>
                </div>
            </CardContent>

            {/* O rodapé se alinha na parte inferior do card */}
            <CardFooter className="flex flex-wrap gap-2 pt-4">
                {isGerenciarEspacos && hasPermission(user, PERMISSION_ESPACOS_ATUALIZAR) ? (
                    <>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                /* Lógica para ver detalhes */
                            }}
                        >
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
