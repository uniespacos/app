import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

type MultiSelectProps = {
    value: string[];
    onValueChange: (values: string[]) => void;
    processing: boolean;
};

export default function MultiSelect({ value, onValueChange, processing }: MultiSelectProps) {
    const tiposDeAcesso = ['terreo', 'escada', 'elevador', 'rampa'];

    const [open, setOpen] = useState(false);
    return (
        <div className="relative">
            <div
                onClick={() => !processing && setOpen(!open)}
                className={`border-input bg-background ring-offset-background flex items-center justify-between rounded-md border px-3 py-2 text-sm ${processing ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
            >
                <div className="flex flex-wrap gap-1">
                    {value.length > 0 ? (
                        value
                            .filter((tipo: string) => value.includes(tipo))
                            .map((tipo: string, index: number) => (
                                <Badge key={index} variant="secondary" className="px-2 py-0">
                                    {tipo}
                                </Badge>
                            ))
                    ) : (
                        <span className="text-muted-foreground">Selecione os tipos de acesso</span>
                    )}
                </div>
                <div className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 opacity-50"
                    >
                        <path d="m6 9 6 6 6-6" />
                    </svg>
                </div>
            </div>

            {open && (
                <div className="bg-popover absolute z-10 mt-1 w-full rounded-md border shadow-md">
                    <div className="p-1">
                        {tiposDeAcesso.map((tipo) => (
                            <div
                                key={tipo}
                                onClick={() => onValueChange(value.includes(tipo) ? value.filter((v) => v !== tipo) : [...value, tipo])}
                                className={`hover:bg-accent hover:text-accent-foreground flex items-center space-x-2 rounded-sm px-2 py-1.5 ${value.includes(tipo) ? 'bg-accent/50' : ''}`}
                            >
                                <Checkbox checked={value.includes(tipo)} className="pointer-events-none" />
                                <span className="text-sm">{tipo}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
