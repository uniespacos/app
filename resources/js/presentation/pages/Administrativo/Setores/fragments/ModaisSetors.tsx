'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Instituicao, Setor, Unidade, User } from '@/types';
import { SetorForm, SetorFormData } from './SetorForm';
import { UsuariosSetor } from './UsuariosSetor';

interface Props {
    // Modal de criação
    isCreateModalOpen: boolean;
    setIsCreateModalOpen: (open: boolean) => void;

    // Modal de edição
    editingSetor: Setor | null;
    setEditingSetor: (setor: Setor | null) => void;

    // Modal de usuários
    viewingUsuarios: Setor | null;
    setViewingUsuarios: (setor: Setor | null) => void;

    // Dados
    instituicao: Instituicao;
    unidades: Unidade[];
    usuarios: User[];

    // Callbacks
    onCreateSetor: (data: SetorFormData) => void;
    onUpdateSetor: (setorId: number, data: SetorFormData) => void;
}

export function ModaisSetor({
    isCreateModalOpen,
    setIsCreateModalOpen,
    editingSetor,
    setEditingSetor,
    viewingUsuarios,
    setViewingUsuarios,
    instituicao,
    unidades,
    usuarios,
    onCreateSetor,
    onUpdateSetor,
}: Props) {
    const getUsuariosDoSetor = (setorId: number) => {
        return usuarios.filter((user) => user.setor?.id === setorId);
    };

    return (
        <>
            {/* Modal de Criação */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Novo Setor</DialogTitle>
                        <DialogDescription>Cadastre um novo setor para uma unidade</DialogDescription>
                    </DialogHeader>
                    <SetorForm
                        instituicao={instituicao}
                        unidades={unidades}
                        onSubmit={(data) => {
                            onCreateSetor(data);
                            setIsCreateModalOpen(false);
                        }}
                        onCancel={() => setIsCreateModalOpen(false)}
                    />
                </DialogContent>
            </Dialog>

            {/* Modal de Edição */}
            <Dialog open={!!editingSetor} onOpenChange={() => setEditingSetor(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Editar Setor</DialogTitle>
                        <DialogDescription>Altere as informações do setor</DialogDescription>
                    </DialogHeader>
                    {editingSetor && (
                        <SetorForm
                            setor={editingSetor}
                            instituicao={instituicao}
                            unidades={unidades}
                            onSubmit={(data) => {
                                onUpdateSetor(editingSetor.id, data);
                                setEditingSetor(null);
                            }}
                            onCancel={() => setEditingSetor(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Modal de Usuários do Setor */}
            <Dialog open={!!viewingUsuarios} onOpenChange={() => setViewingUsuarios(null)}>
                <DialogContent className="max-h-[90vh] w-full overflow-y-auto sm:max-w-[800px] md:max-w-[900px] lg:max-w-[1000px] xl:max-w-[1200px]">
                    <DialogHeader>
                        <DialogTitle>Usuários do Setor</DialogTitle>
                        <DialogDescription>
                            {viewingUsuarios?.nome} - {viewingUsuarios?.unidade?.nome}
                        </DialogDescription>
                    </DialogHeader>
                    {viewingUsuarios && <UsuariosSetor setor={viewingUsuarios} usuarios={getUsuariosDoSetor(viewingUsuarios.id)} />}
                </DialogContent>
            </Dialog>
        </>
    );
}
