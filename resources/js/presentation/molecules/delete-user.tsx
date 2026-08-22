import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';

import InputError from '@/presentation/atoms/input-error';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import HeadingSmall from '@/presentation/atoms/heading-small';

import { Modal } from '@/presentation/molecules/Modal';

export default function DeleteUser() {
    const [open, setOpen] = useState(false);
    const passwordInput = useRef<HTMLInputElement>(null);
    const { data, setData, delete: destroy, processing, reset, errors, clearErrors } = useForm<Required<{ password: string }>>({ password: '' });

    const deleteUser: FormEventHandler = (e) => {
        e.preventDefault();

        destroy(route('settings.profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => { closeModal(); },
            onError: () => passwordInput.current?.focus(),
            onFinish: () => { reset(); },
        });
    };

    const closeModal = () => {
        setOpen(false);
        clearErrors();
        reset();
    };

    return (
        <div className="space-y-6">
            <HeadingSmall title="Excluir conta" description="Exclua sua conta e todos os seus recursos" />

            <div className="space-y-4 rounded-lg border border-destructive/25 bg-destructive-subtle p-4">
                <div className="relative space-y-0.5 text-destructive-accent">
                    <p className="font-medium">Aviso</p>
                    <p className="text-sm">Por favor, prossiga com cautela, esta ação não pode ser desfeita.</p>
                </div>

                <Button variant="destructive" onClick={() => { setOpen(true); }}>
                    Excluir conta
                </Button>

                <Modal
                    open={open}
                    onOpenChange={setOpen}
                    title="Tem certeza que deseja excluir sua conta?"
                    description="Uma vez que sua conta for excluída, todos os seus recursos e dados serão permanentemente removidos. Por favor, digite sua senha para confirmar que deseja excluir permanentemente sua conta."
                >
                    <form className="space-y-6" onSubmit={deleteUser}>
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
                                onChange={(e) => { setData('password', e.target.value); }}
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
                                <button type="submit">Excluir conta</button>
                            </Button>
                        </DialogFooter>
                    </form>
                </Modal>
            </div>
        </div>
    );
}
