import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/presentation/molecules/FormField';
import { Modal } from '@/presentation/molecules/Modal';
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
        <Modal
            open={open}
            onOpenChange={onOpenChange}
            title="Cadastrar Nova Instituição"
            footer={
                <>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={onSubmit} disabled={!isFormValid}>
                        Salvar Instituição
                    </Button>
                </>
            }
        >
            <div className="space-y-4">
                <FormField label="Nome da Instituição" htmlFor="novaInstituicaoNome" required>
                    <Input
                        id="novaInstituicaoNome"
                        name="nome"
                        value={novaInstituicao.nome}
                        onChange={onChange}
                        placeholder="Digite o nome da instituição"
                        required
                        className="h-11"
                    />
                </FormField>

                <FormField label="Unidade" htmlFor="novaInstituicaoUnidade" required>
                    <Input
                        id="novaInstituicaoUnidade"
                        name="unidade"
                        value={novaInstituicao.unidade}
                        onChange={onChange}
                        placeholder="Digite o nome da unidade"
                        required
                        className="h-11"
                    />
                </FormField>

                <FormField label="Setor" htmlFor="novaInstituicaoSetor" required>
                    <Input
                        id="novaInstituicaoSetor"
                        name="setor"
                        value={novaInstituicao.setor}
                        onChange={onChange}
                        placeholder="Digite o nome do setor"
                        required
                        className="h-11"
                    />
                </FormField>
            </div>
        </Modal>
    );
}
