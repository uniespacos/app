import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { TURNO_LABEL, TURNOS_ORDENADOS } from '@/constants/turnos';
import { UserSearchCombobox } from '@/presentation/molecules/UserSearchComboBox';
import type { Espaco, User } from '@/types';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface GerenciarGestoresDialogProps {
    espaco: Espaco | null;
    usuarios: User[];
    isOpen: boolean;
    onClose: () => void;
    onSave: (espacoId: number, gestores: Record<string, number | null>) => void;
}

export function GerenciarGestoresDialog({ espaco, usuarios, onClose, onSave }: GerenciarGestoresDialogProps) {
    const [gestores, setGestores] = useState<Record<string, number | null>>({
        manha: null,
        tarde: null,
        noite: null,
    });

    useEffect(() => {
        if (espaco?.agendas) {
            setGestores({
                manha: espaco.agendas.find((a) => a.turno === 'manha')?.user?.id || null,
                tarde: espaco.agendas.find((a) => a.turno === 'tarde')?.user?.id || null,
                noite: espaco.agendas.find((a) => a.turno === 'noite')?.user?.id || null,
            });
        } else {
            // Garante que o estado seja limpo se o diálogo for fechado (espaco se torna null)
            setGestores({ manha: null, tarde: null, noite: null });
        }
    }, [espaco]); // A dependência é o 'espaco'

    // Memoizar os gestores iniciais para evitar re-renders desnecessários
    const gestoresIniciais = useMemo(() => {
        if (!espaco?.agendas) return { manha: null, tarde: null, noite: null };

        return {
            manha: espaco.agendas.find((a) => a.turno === 'manha')?.user?.id || null,
            tarde: espaco.agendas.find((a) => a.turno === 'tarde')?.user?.id || null,
            noite: espaco.agendas.find((a) => a.turno === 'noite')?.user?.id || null,
        };
    }, [espaco?.agendas]);

    const handleSalvar = useCallback(() => {
        if (espaco) {
            onSave(espaco.id, gestores);
            onClose();
        }
    }, [espaco, gestores, onSave, onClose]);

    const handleGestorChange = useCallback((turno: string, userId: number | null) => {
        setGestores((prev) => ({
            ...prev,
            [turno]: userId,
        }));
    }, []);

    // Verificar se houve mudanças para habilitar/desabilitar o botão salvar
    const hasChanges = useMemo(() => {
        return Object.keys(gestores).some(
            (turno) => gestores[turno as keyof typeof gestores] !== gestoresIniciais[turno as keyof typeof gestoresIniciais],
        );
    }, [gestores, gestoresIniciais]);

    if (!espaco) return null;

    return (
        <Card className="mx-auto w-full">
            <CardHeader>
                <CardTitle>Gerenciar Gestores - {espaco.nome}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="text-muted-foreground text-sm">
                    Selecione os gestores responsáveis por cada turno. Você pode buscar por nome ou email.
                </div>

                <div className="space-y-4">
                    {TURNOS_ORDENADOS.map((turno) => (
                        <div key={turno} className="space-y-2">
                            <Label className="block">{TURNO_LABEL[turno]}</Label>
                            <UserSearchCombobox
                                usuarios={usuarios}
                                value={gestores[turno]}
                                onValueChange={(value) => handleGestorChange(turno, value)}
                                placeholder={`Buscar gestor para o turno da ${TURNO_LABEL[turno].toLowerCase()}...`}
                            />
                        </div>
                    ))}
                </div>

                <div className="flex justify-end gap-2 border-t pt-4">
                    <Button variant="outline" onClick={onClose} type="button">
                        Cancelar
                    </Button>
                    <Button onClick={handleSalvar} disabled={!hasChanges} type="button">
                        {hasChanges ? 'Salvar Alterações' : 'Nenhuma Alteração'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
