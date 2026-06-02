import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type UnidadesFiltersProps = {
    searchTerm: string;
    onSearchTermChange: (value: string) => void;
};

export function UnidadeFilters({ searchTerm, onSearchTermChange }: UnidadesFiltersProps) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row">
            <div className="space-y-2">
                <Label className="text-sm font-medium">Buscar</Label>
                <Input
                    type="search"
                    placeholder="Buscar por nome"
                    className="w-full pl-8"
                    value={searchTerm} // 3. O valor vem das props
                    onChange={(e) => onSearchTermChange(e.target.value)} // 4. A mudança notifica o pai
                />
            </div>
        </div>
    );
}
