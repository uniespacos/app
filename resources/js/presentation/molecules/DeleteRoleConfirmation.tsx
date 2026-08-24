import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import type { Role } from '@/types';
import { router } from '@inertiajs/react';
import { useState } from 'react';

interface DeleteRoleConfirmationProps {
    isOpen: boolean;
    role: Role | null;
    onClose: () => void;
}

export function DeleteRoleConfirmation({ isOpen, role, onClose }: DeleteRoleConfirmationProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        if (!role) return;

        setIsDeleting(true);
        router.delete(route('institucional.roles.destroy', role.id), {
            onSuccess: onClose,
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Deletar Papel</AlertDialogTitle>
                    <AlertDialogDescription>
                        {role?.is_system ? (
                            'Você não pode deletar um papel de sistema.'
                        ) : (
                            <>
                                Tem certeza que deseja deletar o papel <strong>{role?.name}</strong>?
                                {(role?.users_count || 0) > 0 && (
                                    <div className="border-warning/25 bg-warning-subtle mt-2 rounded border p-2 text-sm">
                                        <strong>{role?.users_count}</strong> usuário(s) será(ão) movido(s) para o papel 'comum'.
                                    </div>
                                )}{' '}
                                Esta ação não pode ser desfeita.
                            </>
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex justify-end gap-2">
                    {!role?.is_system && (
                        <>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="bg-destructive hover:bg-destructive/90 text-white"
                            >
                                {isDeleting ? 'Deletando...' : 'Deletar'}
                            </AlertDialogAction>
                        </>
                    )}
                    {role?.is_system && (
                        <Button variant="outline" onClick={onClose}>
                            Fechar
                        </Button>
                    )}
                </div>
            </AlertDialogContent>
        </AlertDialog>
    );
}
