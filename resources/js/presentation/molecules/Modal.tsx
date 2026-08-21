import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

const MODAL_SIZE_CLASSES = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-2xl',
} as const;

type ModalSize = keyof typeof MODAL_SIZE_CLASSES;

interface ModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: ReactNode;
    description?: ReactNode;
    footer?: ReactNode;
    size?: ModalSize;
    showCloseButton?: boolean;
    className?: string;
    children?: ReactNode;
}

// Modal padrão da aplicação: toda tela que precisar de um modal customizado
// deve montar seu organismo por cima deste componente em vez de reimplementar
// Dialog/DialogContent diretamente.
export function Modal({ open, onOpenChange, title, description, footer, size = 'md', showCloseButton = true, className, children }: ModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={cn(MODAL_SIZE_CLASSES[size], className)} showCloseButton={showCloseButton}>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description && <DialogDescription>{description}</DialogDescription>}
                </DialogHeader>

                {children}

                {footer && <DialogFooter>{footer}</DialogFooter>}
            </DialogContent>
        </Dialog>
    );
}
