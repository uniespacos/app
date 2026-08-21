import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';

import InputError from '@/presentation/atoms/input-error';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import HeadingSmall from '@/presentation/atoms/heading-small';

import { Modal } from '@/presentation/molecules/Modal';

type DeleteItemProps = {
    itemName: string;
    isOpen?: (open: boolean) => void;
    route: string;
    showHeading?: boolean;
};

export default function DeleteItem({ isOpen, route, itemName, showHeading = true }: DeleteItemProps) {
    const [open, setOpen] = useState(false);
    const passwordInput = useRef<HTMLInputElement>(null);
    const { data, setData, delete: destroy, processing, reset, errors, clearErrors } = useForm<Required<{ password: string }>>({ password: '' });

    const deleteItem: FormEventHandler = (e) => {
        e.preventDefault();

        destroy(route, {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => {
                closeModal();
                reset();
            },
        });
    };

    const closeModal = () => {
        setOpen(false);
        isOpen?.(false);
        clearErrors();
        reset();
    };

    return (
        <div className="space-y-6">
            {showHeading && <HeadingSmall title={`${itemName}`} description={`Excluir o(a) ${itemName} e as informações permanentemente`} />}

            <div className="space-y-4 rounded-lg border border-destructive/25 bg-destructive-subtle p-4">
                <div className="relative space-y-0.5 text-destructive-accent">
                    <p className="font-medium">Aviso</p>
                    <p className="text-sm">Por favor, prossiga com cautela, esta ação não pode ser desfeita.</p>
                </div>

                <Button variant="destructive" onClick={() => setOpen(true)}>
                    Excluir {itemName}
                </Button>

                <Modal
                    open={open}
                    onOpenChange={setOpen}
                    title={`Tem certeza que deseja excluir o(a) ${itemName}?`}
                    description={`Uma vez que o(a) ${itemName} for excluído, todos os dados serão permanentemente removidos. Por favor, digite sua senha para confirmar que deseja excluir permanentemente o(a) ${itemName}`}
                >
                    <form className="space-y-6" onSubmit={deleteItem}>
                        <div className="grid gap-2">
                            <Label htmlFor="password" className="sr-only">
                                Senha
                            </Label>

                            <Input
                                id="password"
                                type="password"
                                name="password"
                                ref={passwordInput}
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Senha"
                                autoComplete="current-password"
                            />

                            <InputError message={errors.password} />
                        </div>

                        <DialogFooter className="gap-2">
                            <Button type="button" variant="outline" onClick={closeModal}>
                                Cancelar
                            </Button>

                            <Button variant="destructive" disabled={processing} asChild>
                                <button type="submit">Excluir {itemName}</button>
                            </Button>
                        </DialogFooter>
                    </form>
                </Modal>
            </div>
        </div>
    );
}
