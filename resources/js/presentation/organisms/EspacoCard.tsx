import espacoImage from '@/assets/espaco.png';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { PERMISSION_ESPACOS_ATUALIZAR } from '@/constants/permissions';
import { hasPermission } from '@/lib/auth';
import { getAndarLabelByValue } from '@/lib/utils/andars/AndarOptions';
import type { Espaco, User } from '@/types';
import { Building2, ChevronRight, Edit, Heart, Layers, MapPin, Trash2, Users } from 'lucide-react';

import { useFavoritarEspacoUseCase } from '@/application/espacos/use-cases/use-favoritar-espaco-usecase';
import { InertiaEspacosRepository } from '@/infrastructure/espacos/inertia-espacos-repository';
import { InertiaHttpGateway } from '@/infrastructure/shared/inertia-http-gateway';

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

    const isModoGerenciamento = Boolean(isGerenciarEspacos) && hasPermission(user, PERMISSION_ESPACOS_ATUALIZAR);
    // Fora do modo de gerenciamento, o card inteiro é o link para a agenda do
    // espaço — não faz sentido repetir a mesma ação num botão "Ver agenda" no
    // rodapé quando clicar em qualquer parte do card já leva para lá.
    const isClicavel = !isModoGerenciamento;
    const irParaAgenda = () => handleSolicitarReserva?.(String(espaco.id));

    return (
        // Card sem o py-6/gap-6 padrão do shadcn: aquele padding é o que deixava
        // uma tarja da cor do card acima e abaixo da imagem (ela nunca alcançava
        // as bordas arredondadas). Com py-0 a imagem é o primeiro filho colado no
        // topo, e o overflow-hidden faz o efeito de máscara nos cantos do Card.
        <Card
            role={isClicavel ? 'button' : undefined}
            tabIndex={isClicavel ? 0 : undefined}
            onClick={isClicavel ? irParaAgenda : undefined}
            onKeyDown={isClicavel ? (e) => e.key === 'Enter' && irParaAgenda() : undefined}
            className={`flex flex-col gap-0 overflow-hidden py-0 ${isClicavel ? 'hover:border-primary/40 cursor-pointer transition-colors hover:shadow-sm' : ''}`}
        >
            {/* --- Seção da Imagem/Carrossel --- */}
            {/* stopPropagation: cliques nas setas do carrossel e no botão de
                favoritar não podem "vazar" para o onClick do card e disparar
                a navegação para a agenda. */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
                <Carousel className="w-full">
                    <CarouselContent>
                        {imageSources.map((src, index) => (
                            <CarouselItem key={index}>
                                {/* bg-muted por trás: sem isso, uma imagem quebrada ou
                                    ainda carregando deixava o card com um retângulo
                                    preto sólido — chamativo ao lado dos outros cards
                                    com o placeholder visível. */}
                                <div className="bg-muted aspect-video">
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

                {/* Botão de Favoritar posicionado sobre a imagem. Padding um pouco
                    maior que o alvo de toque mínimo (44px) para não ficar apertado no mobile. */}
                {showFavoritar && (
                    <button
                        onClick={handleFavoritarEspaco}
                        disabled={processing}
                        className={`absolute top-2 right-2 rounded-full p-2.5 shadow-md transition-all duration-200 ${isFavorited ? 'bg-destructive hover:bg-destructive text-white' : 'bg-background text-foreground hover:bg-muted'} ${processing ? 'cursor-not-allowed opacity-70' : ''}`}
                        title={isFavorited ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
                    >
                        <Heart className={`h-5 w-5 ${isFavorited ? 'fill-current' : ''}`} />
                    </button>
                )}
            </div>

            <CardHeader className="pt-4">
                <CardTitle className="truncate text-xl" title={espaco.nome}>
                    {espaco.nome}
                </CardTitle>
            </CardHeader>

            {/* flex-grow para que esta área ocupe o espaço disponível, empurrando o rodapé para baixo */}
            <CardContent className="flex-grow pt-4">
                <div className="grid grid-cols-2 gap-2">
                    <Badge variant="outline" className="w-full min-w-0 justify-start gap-1.5 overflow-hidden">
                        <Building2 className="h-4 w-4 flex-shrink-0" />
                        <span className="min-w-0 truncate">{modulo ?? 'N/A'}</span>
                    </Badge>
                    <Badge variant="outline" className="w-full min-w-0 justify-start gap-1.5 overflow-hidden">
                        <Layers className="h-4 w-4 flex-shrink-0" />
                        <span className="min-w-0 truncate">{espaco.andar?.nome ? getAndarLabelByValue(espaco.andar.nome) : 'N/A'}</span>
                    </Badge>
                    <Badge variant="outline" className="w-full min-w-0 justify-start gap-1.5 overflow-hidden">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span className="min-w-0 truncate">{espaco.andar?.modulo?.unidade?.sigla ?? 'N/A'}</span>
                    </Badge>
                    <Badge variant="outline" className="w-full min-w-0 justify-start gap-1.5 overflow-hidden">
                        <Users className="h-4 w-4 flex-shrink-0" />
                        <span className="min-w-0 truncate">{espaco.capacidade_pessoas} pessoas</span>
                    </Badge>
                </div>
            </CardContent>

            {/* O rodapé se alinha na parte inferior do card */}
            {isModoGerenciamento ? (
                <CardFooter className="flex flex-wrap gap-2 py-4">
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
                        <Edit className="mr-1.5 h-4 w-4" />
                        Editar
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleExcluirEspaco?.(String(espaco.id))}>
                        <Trash2 className="mr-1.5 h-4 w-4" />
                        Excluir
                    </Button>
                </CardFooter>
            ) : (
                // Dica de que o card é clicável, não um botão — a ação já é
                // acionada pelo card inteiro (ver `isClicavel` acima).
                <CardFooter className="text-primary flex items-center justify-end gap-1 py-4 text-sm font-medium">
                    Ver disponibilidade
                    <ChevronRight className="h-4 w-4" />
                </CardFooter>
            )}
        </Card>
    );
}
