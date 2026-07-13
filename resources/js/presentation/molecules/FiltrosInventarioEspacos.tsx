import { FiltrosRelatorio } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
    filtros: Partial<FiltrosRelatorio>;
    onChange: (filtros: Partial<FiltrosRelatorio>) => void;
}

export function FiltrosInventarioEspacos({ filtros, onChange }: Props) {
    const handleChange = (field: string, value: string) => {
        const numValue = value ? parseInt(value, 10) : undefined;
        onChange({
            ...filtros,
            [field]: numValue,
        });
    };

    return (
        <div className="space-y-4">
            <div>
                <Label htmlFor="unidade_id" className="mb-2 block">
                    ID Unidade
                </Label>
                <Input
                    id="unidade_id"
                    type="number"
                    placeholder="Deixe em branco para ver todas"
                    value={filtros.unidade_id || ''}
                    onChange={(e) => handleChange('unidade_id', e.target.value)}
                />
            </div>

            <div>
                <Label htmlFor="modulo_id" className="mb-2 block">
                    ID Módulo
                </Label>
                <Input
                    id="modulo_id"
                    type="number"
                    placeholder="Deixe em branco para ver todos"
                    value={filtros.modulo_id || ''}
                    onChange={(e) => handleChange('modulo_id', e.target.value)}
                />
            </div>

            <div>
                <Label htmlFor="andar_id" className="mb-2 block">
                    ID Andar
                </Label>
                <Input
                    id="andar_id"
                    type="number"
                    placeholder="Deixe em branco para ver todos"
                    value={filtros.andar_id || ''}
                    onChange={(e) => handleChange('andar_id', e.target.value)}
                />
            </div>

            <div>
                <Label htmlFor="espaco_id" className="mb-2 block">
                    ID Espaço
                </Label>
                <Input
                    id="espaco_id"
                    type="number"
                    placeholder="Deixe em branco para ver todos"
                    value={filtros.espaco_id || ''}
                    onChange={(e) => handleChange('espaco_id', e.target.value)}
                />
            </div>
        </div>
    );
}
