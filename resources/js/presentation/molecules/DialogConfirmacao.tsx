import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Espaco } from '@/types';

interface DialogConfirmacaoProps {
    espaco: Espaco | null;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (espaco: Espaco) => void;
}

export function DialogConfirmacao({ espaco, isOpen, onClose, onConfirm }: DialogConfirmacaoProps) {
    const handleConfirm = () => {
        if (espaco) {
            onConfirm(espaco);
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Confirmar Exclusão</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <p>
                        Tem certeza que deseja excluir o espaço <strong>{espaco?.nome}</strong>?
                    </p>
                    <p className="text-muted-foreground mt-2 text-sm">Esta ação não pode ser desfeita.</p>
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button variant="destructive" onClick={handleConfirm}>
                        Excluir
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
