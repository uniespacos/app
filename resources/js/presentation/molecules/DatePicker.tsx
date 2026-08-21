import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';

interface DatePickerProps {
    value?: Date;
    onSelect: (date: Date | undefined) => void;
    /** Predicado de dia desabilitado no calendário (não confundir com buttonDisabled). */
    disabled?: (date: Date) => boolean;
    /** Desabilita o próprio campo/gatilho, independente do calendário. */
    buttonDisabled?: boolean;
    /** Repassado ao Popover — necessário quando o DatePicker vive dentro de outro Dialog/Popover. */
    modal?: boolean;
    placeholder?: string;
    className?: string;
}

// Combo Popover + Calendar + Button padrão para seleção de data, antes
// duplicado à mão em cada tela que precisava de um campo de data.
export function DatePicker({ value, onSelect, disabled, buttonDisabled, modal, placeholder = 'Selecione...', className }: DatePickerProps) {
    return (
        <Popover modal={modal}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    disabled={buttonDisabled}
                    className={cn('w-full justify-start text-left font-normal', !value && 'text-muted-foreground', className)}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {value ? format(value, 'dd/MM/yyyy', { locale: ptBR }) : placeholder}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={value} onSelect={onSelect} disabled={disabled} initialFocus />
            </PopoverContent>
        </Popover>
    );
}
