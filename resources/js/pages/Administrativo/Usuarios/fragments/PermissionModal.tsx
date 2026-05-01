'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ROLE_COMUM, ROLE_GESTOR, ROLE_INSTITUCIONAL } from '@/constants/permissions';
import { Agenda, Instituicao, SelectedAgenda, User } from '@/types';
import { useEffect, useState } from 'react';
import FiltroBuscaPermission from './FiltroBuscaPermission';

const ROLE_OPTIONS = [
    { value: ROLE_INSTITUCIONAL, label: 'Institucional' },
    { value: ROLE_GESTOR, label: 'Gestor' },
    { value: ROLE_COMUM, label: 'Comum' },
];

interface PermissionModalProps {
    user: User | undefined;
    isOpen: boolean;
    processing?: boolean;
    onClose: () => void;
    onUpdate: (userId: number, roleName: string, agendas?: number[]) => void;
    instituicoes: Instituicao[];
    initialAgendas?: Agenda[];
}

export function PermissionModal({ user, isOpen, onClose, onUpdate, instituicoes, processing = false }: PermissionModalProps) {
    const [selectedRole, setSelectedRole] = useState<string>(ROLE_COMUM);
    const [selectedAgendas, setSelectedAgendas] = useState<SelectedAgenda[]>(
        user?.agendas!.map(
            (agenda) =>
                ({
                    agenda: agenda,
                    espaco: agenda.espaco,
                    andar: agenda.espaco?.andar,
                    modulo: agenda.espaco?.andar?.modulo,
                    unidade: agenda.espaco?.andar?.modulo?.unidade,
                    instituicao: agenda.espaco?.andar?.modulo?.unidade?.instituicao,
                }) as SelectedAgenda,
        ) || [],
    );

    useEffect(() => {
        if (user) {
            setSelectedRole(user.roles?.[0] ?? ROLE_COMUM);
        }
    }, [user]);

    const handleSubmit = () => {
        if (!user) return;

        const agendaIds = selectedAgendas.map((sa) => sa.agenda.id);
        onUpdate(user.id, selectedRole, agendaIds);
    };

    if (!user) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Gerenciar Permissões - {user.name}</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="permission-type">Tipo de Permissão</Label>
                        <Select value={selectedRole} onValueChange={setSelectedRole}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o tipo de permissão" />
                            </SelectTrigger>
                            <SelectContent>
                                {ROLE_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedRole === ROLE_GESTOR && (
                        <FiltroBuscaPermission
                            instituicoes={instituicoes}
                            selectedAgendas={selectedAgendas}
                            setSelectedAgendas={setSelectedAgendas}
                        />
                    )}

                    <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSubmit} disabled={processing}>
                            Salvar Permissões
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
