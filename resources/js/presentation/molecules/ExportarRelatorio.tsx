import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FormatoRelatorio } from '@/types';
import { ChevronDown, Download, Loader2 } from 'lucide-react';

interface Props {
    onExport: (formato: FormatoRelatorio) => void;
    estaGerando: boolean;
    disabled?: boolean;
}

const FORMATOS: { value: FormatoRelatorio; label: string }[] = [
    { value: 'pdf', label: 'PDF' },
    { value: 'csv', label: 'CSV' },
    { value: 'xlsx', label: 'XLSX' },
];

export function ExportarRelatorio({ onExport, estaGerando, disabled }: Props) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={disabled || estaGerando} className="gap-2">
                    {estaGerando ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Download className="h-4 w-4" />
                    )}
                    {estaGerando ? 'Gerando...' : 'Exportar'}
                    <ChevronDown className="text-muted-foreground h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuLabel>Formato</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {FORMATOS.map((formato) => (
                    <DropdownMenuItem key={formato.value} onSelect={() => { onExport(formato.value); }}>
                        {formato.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
