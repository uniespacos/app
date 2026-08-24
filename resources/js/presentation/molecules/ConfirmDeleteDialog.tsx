import type React from 'react';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface ConfirmDeleteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    description: React.ReactNode;
    onConfirm: () => void;
    isDeleting?: boolean;
    confirmText?: string;
    cancelText?: string;
    disabled?: boolean;
    showCancel?: boolean;
    closeText?: string;
}

export function ConfirmDeleteDialog({
    open,
    onOpenChange,
    title = 'Confirmar Exclusão',
    description,
    onConfirm,
    isDeleting = false,
    confirmText = 'Excluir',
    cancelText = 'Cancelar',
    disabled = false,
    showCancel = true,
    closeText,
}: ConfirmDeleteDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2">
                    {disabled && closeText ? (
                        <Button
                            variant="outline"
                            onClick={() => {
                                onOpenChange(false);
                            }}
                            type="button"
                        >
                            {closeText}
                        </Button>
                    ) : (
                        <>
                            {showCancel && <AlertDialogCancel disabled={isDeleting}>{cancelText}</AlertDialogCancel>}
                            <AlertDialogAction
                                onClick={(e) => {
                                    e.preventDefault();
                                    onConfirm();
                                }}
                                disabled={disabled || isDeleting}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                {isDeleting ? 'Excluindo...' : confirmText}
                            </AlertDialogAction>
                        </>
                    )}
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
