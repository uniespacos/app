import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef } from 'react';

import InputError from '@/presentation/atoms/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import HeadingSmall from '@/presentation/atoms/heading-small';

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

type DeleteItemProps = {
    itemName: string;
    isOpen?: (open: boolean) => void;
    route: string;
    showHeading?: boolean;
};

export default function DeleteItem({ isOpen, route, itemName, showHeading = true }: DeleteItemProps) {
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
        isOpen?.(false);
        clearErrors();
        reset();
    };

    return (
        <div className="space-y-6">
            {showHeading && <HeadingSmall title={`${itemName}`} description={`Excluir o(a) ${itemName} e as informações permanentemente`} />}

            <div className="space-y-4 rounded-lg border border-red-100 bg-red-50 p-4 dark:border-red-200/10 dark:bg-red-700/10">
                <div className="relative space-y-0.5 text-red-600 dark:text-red-100">
                    <p className="font-medium">Aviso</p>
                    <p className="text-sm">Por favor, prossiga com cautela, esta ação não pode ser desfeita.</p>
                </div>

                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="destructive">Excluir {itemName}</Button>
                    </DialogTrigger>

                    <DialogContent>
                        <DialogTitle>{`Tem certeza que deseja excluir o(a) ${itemName}? `}</DialogTitle>

                        <DialogDescription>
                            {`Uma vez que o(a) ${itemName} for excluído, todos os dados serão permanentemente removidos. Por favor, digite sua senha para
                            confirmar que deseja excluir permanentemente o(a) ${itemName}`}
                        </DialogDescription>

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
                                <DialogClose asChild>
                                    <Button variant="secondary" onClick={closeModal}>
                                        Cancelar
                                    </Button>
                                </DialogClose>

                                <Button variant="destructive" disabled={processing} asChild>
                                    <button type="submit">Excluir {itemName}</button>
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
