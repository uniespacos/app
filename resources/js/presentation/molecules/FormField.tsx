import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface FormFieldProps {
    label: string;
    htmlFor: string;
    error?: string;
    required?: boolean;
    className?: string;
    children: ReactNode;
}

// Generaliza o padrão Label + campo + erro repetido manualmente em cada
// formulário (ver EspacoFormFields.tsx). O campo em si (Input, Textarea,
// Select, DatePicker...) entra como children.
export function FormField({ label, htmlFor, error, required, className, children }: FormFieldProps) {
    return (
        <div className={cn('space-y-2', className)}>
            <Label htmlFor={htmlFor}>
                {label}
                {required && <span className="text-destructive"> *</span>}
            </Label>
            {children}
            {error && <p className="text-destructive text-sm">{error}</p>}
        </div>
    );
}
