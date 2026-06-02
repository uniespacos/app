import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type React from 'react';

interface ModalNovaInstituicaoProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    novaInstituicao: {
        nome: string;
        unidade: string;
        setor: string;
    };
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: () => void;
}

export function ModalNovaInstituicao({ open, onOpenChange, novaInstituicao, onChange, onSubmit }: ModalNovaInstituicaoProps) {
    const isFormValid = novaInstituicao.nome.trim() && novaInstituicao.unidade.trim() && novaInstituicao.setor.trim();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Cadastrar Nova Instituição</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="novaInstituicaoNome">Nome da Instituição *</Label>
                        <Input
                            id="novaInstituicaoNome"
                            name="nome"
                            value={novaInstituicao.nome}
                            onChange={onChange}
                            placeholder="Digite o nome da instituição"
                            required
                            className="h-11"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="novaInstituicaoUnidade">Unidade *</Label>
                        <Input
                            id="novaInstituicaoUnidade"
                            name="unidade"
                            value={novaInstituicao.unidade}
                            onChange={onChange}
                            placeholder="Digite o nome da unidade"
                            required
                            className="h-11"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="novaInstituicaoSetor">Setor *</Label>
                        <Input
                            id="novaInstituicaoSetor"
                            name="setor"
                            value={novaInstituicao.setor}
                            onChange={onChange}
                            placeholder="Digite o nome do setor"
                            required
                            className="h-11"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={onSubmit} disabled={!isFormValid}>
                            Salvar Instituição
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
