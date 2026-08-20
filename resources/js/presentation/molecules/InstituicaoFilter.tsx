import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type InstituicaoFiltersProps = {
    searchTerm: string;
    onSearchTermChange: (value: string) => void;
};

export function InstituicaoFilters({ searchTerm, onSearchTermChange }: InstituicaoFiltersProps) {
    return (
        <Card>
            <CardContent className="space-y-2">
                <Label className="text-sm font-medium">Buscar</Label>
                <Input
                    type="search"
                    placeholder="Buscar por nome ou sigla"
                    className="w-full pl-8"
                    value={searchTerm} // 3. O valor vem das props
                    onChange={(e) => onSearchTermChange(e.target.value)} // 4. A mudança notifica o pai
                />
            </CardContent>
        </Card>
    );
}
