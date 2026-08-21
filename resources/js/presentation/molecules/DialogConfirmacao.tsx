import { Button } from '@/components/ui/button';
import { Modal } from '@/presentation/molecules/Modal';
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
        <Modal
            open={isOpen}
            onOpenChange={onClose}
            title="Confirmar Exclusão"
            description="Esta ação não pode ser desfeita."
            footer={
                <>
                    <Button variant="outline" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button variant="destructive" onClick={handleConfirm}>
                        Excluir
                    </Button>
                </>
            }
        >
            <p>
                Tem certeza que deseja excluir o espaço <strong>{espaco?.nome}</strong>?
            </p>
        </Modal>
    );
}
