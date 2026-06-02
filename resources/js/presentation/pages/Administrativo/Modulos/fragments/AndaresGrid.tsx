'use client';

import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';
import AndarFormCard from './AndarFormCard';

interface AndaresGridProps {
    andares: {
        nome: string;
        tipo_acesso: string[];
    }[];
    onUpdate: (index: number, andar: { nome: string; tipo_acesso: string[] }) => void;
    onRemove: (index: number) => void;
    onAdd: () => void;
    onCollapseAll: () => void;
    onExpandAll: () => void;
    errors?: Record<string, string>;
    processing: boolean;
}

export default function AndaresGrid({ andares, onUpdate, onRemove, onAdd, onCollapseAll, onExpandAll, errors, processing }: AndaresGridProps) {
    return (
        <div className="space-y-4">
            {/* Controles da Grid */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm">
                        {andares.length} andar{andares.length !== 1 ? 'es' : ''} configurado{andares.length !== 1 ? 's' : ''}
                    </span>
                    {andares.length > 3 && (
                        <div className="flex gap-1">
                            <Button type="button" variant="ghost" size="sm" onClick={onCollapseAll} className="h-7 text-xs">
                                <Minus className="mr-1 h-3 w-3" />
                                Recolher
                            </Button>
                            <Button type="button" variant="ghost" size="sm" onClick={onExpandAll} className="h-7 text-xs">
                                <Plus className="mr-1 h-3 w-3" />
                                Expandir
                            </Button>
                        </div>
                    )}
                </div>
                <Button type="button" variant="outline" size="sm" onClick={onAdd} disabled={processing}>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Andar
                </Button>
            </div>

            {/* Grid de Andares */}
            {andares.length === 0 ? (
                <div className="text-muted-foreground rounded-lg border-2 border-dashed py-12 text-center">
                    <div className="space-y-2">
                        <p>Nenhum andar adicionado ainda.</p>
                        <p className="text-sm">Clique em "Adicionar Andar" para começar.</p>
                    </div>
                </div>
            ) : (
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {andares.map((andar, index) => (
                        <AndarFormCard
                            key={index}
                            andar={andar}
                            index={index}
                            onUpdate={onUpdate}
                            onRemove={onRemove}
                            canRemove={andares.length > 1}
                            errors={errors}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
