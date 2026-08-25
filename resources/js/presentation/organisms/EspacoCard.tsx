import espacoImage from '@/assets/espaco.png';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { PERMISSION_ESPACOS_ATUALIZAR } from '@/constants/permissions';
import { hasPermission } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { getAndarLabelByValue } from '@/lib/utils/andars/AndarOptions';
import type { Espaco, User } from '@/types';
import { router } from '@inertiajs/react';
import { Building2, ChevronRight, Edit, Heart, Layers, MapPin, Trash2, Users } from 'lucide-react';
import { useState } from 'react';

declare function route(name: string, params?: unknown): string;

interface CardEspacoProps {
    espaco: Espaco;
    user: User | null;
    isGerenciarEspacos?: boolean;
    handleSolicitarReserva?: (espacoId: string) => void;
    handleEditarEspaco?: (espacoId: string) => void;
    handleExcluirEspaco?: (espacoId: string) => void;
    showFavoritar?: boolean;
}

export default function EspacoCard({
    espaco,
    user,
    isGerenciarEspacos,
    handleSolicitarReserva,
    handleEditarEspaco,
    handleExcluirEspaco,
    showFavoritar = true,
}: CardEspacoProps) {
    const [isFavorited, setIsFavorited] = useState<boolean>(espaco.is_favorited_by_user ?? false);
    const [processing, setProcessing] = useState(false);

    const modulo = espaco.andar?.modulo?.nome;
    const andarLabel = espaco.andar?.nome ? getAndarLabelByValue(espaco.andar.nome) : undefined;
    const unidadeSigla = espaco.andar?.modulo?.unidade?.sigla || espaco.andar?.modulo?.unidade?.nome || 'UESB';

    const handleFavoritarEspaco = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        setProcessing(true);
        if (isFavorited) {
            router.delete(route('espacos.desfavoritar', espaco.id), {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setIsFavorited(false);
                },
                onError: () => {
                    setIsFavorited(true);
                },
                onFinish: () => {
                    setProcessing(false);
                },
            });
        } else {
            router.post(
                route('espacos.favoritar', espaco.id),
                {},
                {
                    preserveScroll: true,
                    preserveState: true,
                    onSuccess: () => {
                        setIsFavorited(true);
                    },
                    onError: () => {
                        setIsFavorited(false);
                    },
                    onFinish: () => {
                        setProcessing(false);
                    },
                },
            );
        }
    };

    const imageSources =
        espaco.imagens && espaco.imagens.length > 0
            ? espaco.imagens.map((img) => `/storage/${img}`)
            : [espaco.main_image_index ? `/storage/${espaco.main_image_index}` : espacoImage];

    const isModoGerenciamento = Boolean(isGerenciarEspacos) && hasPermission(user, PERMISSION_ESPACOS_ATUALIZAR);
    const isClicavel = !isModoGerenciamento;

    const handleCardClick = () => {
        if (isClicavel) {
            if (handleSolicitarReserva) {
                handleSolicitarReserva(String(espaco.id));
            } else {
                router.get(`/espacos/${espaco.id}`);
            }
        }
    };

    return (
        <Card
            role={isClicavel ? 'button' : undefined}
            tabIndex={isClicavel ? 0 : undefined}
            onClick={handleCardClick}
            onKeyDown={(e) => isClicavel && e.key === 'Enter' && handleCardClick()}
            className={cn(
                'group border-border/80 bg-card flex flex-col overflow-hidden rounded-2xl border transition-all duration-300',
                isClicavel && 'hover:border-primary/40 cursor-pointer hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]',
            )}
        >
            {/* Carousel & Media Container */}
            <div className="bg-muted relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <AspectRatio ratio={16 / 9}>
                    <Carousel className="h-full w-full">
                        <CarouselContent className="ml-0 h-full">
                            {imageSources.map((src, index) => (
                                <CarouselItem key={index} className="h-full pl-0">
                                    <img
                                        src={src}
                                        alt={`Foto ${index + 1} de ${espaco.nome}`}
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        loading="lazy"
                                        decoding="async"
                                        onError={(e) => {
                                            e.currentTarget.src = espacoImage;
                                        }}
                                    />
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        {imageSources.length > 1 && (
                            <>
                                <CarouselPrevious className="bg-background/80 absolute top-1/2 left-3 -translate-y-1/2 backdrop-blur-xs" />
                                <CarouselNext className="bg-background/80 absolute top-1/2 right-3 -translate-y-1/2 backdrop-blur-xs" />
                            </>
                        )}
                    </Carousel>
                </AspectRatio>

                {/* Badge Flutuante de Unidade com Glassmorphism */}
                <div className="absolute top-3 left-3 z-10">
                    <Badge variant="secondary" className="bg-background/85 text-xs font-medium shadow-sm backdrop-blur-md">
                        <Building2 className="mr-1 h-3 w-3" />
                        {unidadeSigla}
                    </Badge>
                </div>

                {/* Botão de Favoritar com Glassmorphism e Touch Target de 44px */}
                {showFavoritar && (
                    <button
                        type="button"
                        onClick={handleFavoritarEspaco}
                        disabled={processing}
                        title={isFavorited ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
                        aria-label={isFavorited ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
                        className={cn(
                            'absolute top-2.5 right-2.5 z-10 flex h-11 min-h-[44px] w-11 min-w-[44px] items-center justify-center rounded-full',
                            'bg-background/85 hover:bg-background shadow-sm backdrop-blur-md transition-transform active:scale-90',
                            isFavorited ? 'text-destructive' : 'text-foreground hover:text-destructive',
                            processing && 'cursor-not-allowed opacity-70',
                        )}
                    >
                        <Heart className={cn('h-5 w-5 transition-colors', isFavorited && 'fill-current')} />
                    </button>
                )}
            </div>

            {/* Informações Principais */}
            <CardHeader className="p-4 pb-2">
                <CardTitle className="text-foreground truncate text-base font-semibold tracking-tight" title={espaco.nome}>
                    {espaco.nome}
                </CardTitle>
                <div className="text-muted-foreground flex items-center gap-1.5 truncate text-xs">
                    <MapPin className="text-muted-foreground/80 h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{modulo ? `${modulo} • ${andarLabel ?? 'Térreo'}` : 'Localização não informada'}</span>
                </div>
            </CardHeader>

            {/* Metadados do Espaço */}
            <CardContent className="flex-grow px-4 py-2">
                <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
                    <span className="bg-secondary text-secondary-foreground inline-flex items-center gap-1 rounded-md px-2.5 py-1 font-medium">
                        <Users className="h-3.5 w-3.5 shrink-0" />
                        {espaco.capacidade_pessoas} {espaco.capacidade_pessoas === 1 ? 'pessoa' : 'pessoas'}
                    </span>
                    {andarLabel && (
                        <span className="bg-secondary text-secondary-foreground inline-flex items-center gap-1 rounded-md px-2.5 py-1 font-medium">
                            <Layers className="h-3.5 w-3.5 shrink-0" />
                            {andarLabel}
                        </span>
                    )}
                </div>
            </CardContent>

            {/* Rodapé de Ações */}
            {isModoGerenciamento ? (
                <CardFooter className="border-border/60 bg-muted/20 flex flex-wrap items-center justify-end gap-2 border-t p-3">
                    <Button variant="outline" size="sm" onClick={() => handleSolicitarReserva?.(String(espaco.id))}>
                        Detalhes
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => handleEditarEspaco?.(String(espaco.id))}>
                        <Edit className="mr-1.5 h-3.5 w-3.5" />
                        Editar
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleExcluirEspaco?.(String(espaco.id))}>
                        <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                        Excluir
                    </Button>
                </CardFooter>
            ) : (
                <CardFooter className="border-border/40 text-primary flex items-center justify-between border-t p-4 pt-2 text-xs font-medium">
                    <span>Consultar horários</span>
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </CardFooter>
            )}
        </Card>
    );
}
