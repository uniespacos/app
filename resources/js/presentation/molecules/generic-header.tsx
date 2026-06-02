import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import { useCallback } from 'react';

type HeaderEspacoProps = {
    titulo: string;
    descricao: string;
    canSeeButton?: boolean;
    buttonText?: string;
    ButtonIcon?: React.ComponentType<{ className?: string }>;
    buttonLink?: string;
    buttonOnClick?: () => void;
};

export default function GenericHeader({ canSeeButton, titulo, descricao, ButtonIcon, buttonText, buttonLink, buttonOnClick }: HeaderEspacoProps) {
    const handleOnClick = useCallback(() => {
        if (buttonOnClick) {
            buttonOnClick();
        }
        if (buttonLink) {
            router.get(buttonLink);
        }
    }, [buttonLink, buttonOnClick]);

    return (
        <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">{titulo}</h1>
                <p className="text-muted-foreground">{descricao}</p>
            </div>
            {canSeeButton && (
                <Button className="flex items-center gap-2" onClick={handleOnClick}>
                    {ButtonIcon && <ButtonIcon className="h-4 w-4" />}
                    {buttonText || 'N/A'}
                </Button>
            )}
        </header>
    );
}
