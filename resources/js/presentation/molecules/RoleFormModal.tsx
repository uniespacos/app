import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { router } from '@inertiajs/react';
import type { Role, Permission } from '@/types';
import { useEffect, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { getGroupLabel, getPermissionLabel } from '@/constants/permission-labels';

const roleFormSchema = z.object({
    name: z
        .string()
        .min(1, 'Nome é obrigatório')
        .max(50, 'Nome deve ter no máximo 50 caracteres')
        .regex(
            /^[a-z][a-z0-9-]*$/,
            'Use apenas letras minúsculas, números e hífens (ex: secretaria-academica). Deve começar com letra.',
        ),
    description: z.string().max(500, 'Descrição deve ter no máximo 500 caracteres').optional(),
    permissions: z.array(z.string()).optional(),
});

type RoleFormData = z.infer<typeof roleFormSchema>;

interface RoleFormModalProps {
    isOpen: boolean;
    role?: Role | null;
    permissions: Record<string, Permission[]>;
    onClose: () => void;
}

function slugify(value: string): string {
    return value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .replace(/-{2,}/g, '-');
}

export function RoleFormModal({ isOpen, role, permissions, onClose }: RoleFormModalProps) {
    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        watch,
        setValue,
    } = useForm<RoleFormData>({
        resolver: zodResolver(roleFormSchema),
        defaultValues: {
            name: '',
            description: '',
            permissions: [],
        },
    });

    const selectedPermissions = watch('permissions') || [];
    const nameValue = watch('name') || '';
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (role) {
            reset({
                name: role.name,
                description: role.description || '',
                permissions: role.permissions || [],
            });
        } else {
            reset({
                name: '',
                description: '',
                permissions: [],
            });
        }
    }, [role, isOpen, reset]);

    const handleTogglePermission = (permissionName: string) => {
        const current = selectedPermissions || [];
        const updated = current.includes(permissionName)
            ? current.filter((p) => p !== permissionName)
            : [...current, permissionName];
        setValue('permissions', updated, { shouldValidate: true });
    };

    const handleToggleGroup = (group: string, perms: Permission[]) => {
        const groupNames = perms.map((p) => p.name);
        const allSelected = groupNames.every((n) => selectedPermissions.includes(n));
        const updated = allSelected
            ? selectedPermissions.filter((n) => !groupNames.includes(n))
            : [...new Set([...selectedPermissions, ...groupNames])];
        setValue('permissions', updated, { shouldValidate: true });
    };

    const groupStats = useMemo(() => {
        const stats: Record<string, { selected: number; total: number }> = {};
        Object.entries(permissions).forEach(([group, perms]) => {
            stats[group] = {
                total: perms.length,
                selected: perms.filter((p) => selectedPermissions.includes(p.name)).length,
            };
        });
        return stats;
    }, [permissions, selectedPermissions]);

    const onSubmit = (data: RoleFormData) => {
        if (role) {
            router.put(route('institucional.roles.update', role.id), data, {
                onSuccess: onClose,
            });
        } else {
            router.post(route('institucional.roles.store'), data, {
                onSuccess: onClose,
            });
        }
    };

    const slugSuggestion = nameValue && !/^[a-z][a-z0-9-]*$/.test(nameValue) ? slugify(nameValue) : null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{role ? 'Editar Papel' : 'Criar Novo Papel'}</DialogTitle>
                    <DialogDescription>
                        {role ? 'Atualize os detalhes do papel' : 'Crie um novo papel customizado'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome (identificador técnico)</Label>
                            <Controller
                                name="name"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        id="name"
                                        {...field}
                                        placeholder="ex: secretaria-academica"
                                        disabled={role?.is_system}
                                    />
                                )}
                            />
                            {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>}
                            {slugSuggestion && !errors.name?.message?.includes('obrigatório') && (
                                <button
                                    type="button"
                                    onClick={() => setValue('name', slugSuggestion, { shouldValidate: true })}
                                    className="mt-1 text-sm text-info-accent hover:underline"
                                >
                                    Usar sugestão: <strong>{slugSuggestion}</strong>
                                </button>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Descrição (opcional)</Label>
                            <Controller
                                name="description"
                                control={control}
                                render={({ field }) => (
                                    <Textarea
                                        id="description"
                                        {...field}
                                        placeholder="Para que serve esse papel..."
                                        rows={3}
                                    />
                                )}
                            />
                            {errors.description && <p className="mt-1 text-sm text-destructive">{errors.description.message}</p>}
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <Label className="text-base">Permissões</Label>
                            <Badge variant="secondary">{selectedPermissions.length} selecionadas</Badge>
                        </div>

                        <div className="space-y-2">
                            {Object.entries(permissions).map(([group, perms]) => {
                                const stats = groupStats[group];
                                const allSelected = stats.selected === stats.total;
                                const someSelected = stats.selected > 0 && !allSelected;
                                const isOpen = openGroups[group] ?? false;

                                return (
                                    <Collapsible
                                        key={group}
                                        open={isOpen}
                                        onOpenChange={(o) => setOpenGroups((prev) => ({ ...prev, [group]: o }))}
                                        className="rounded-md border"
                                    >
                                        <div className="flex items-center justify-between p-3 hover:bg-muted/50">
                                            <div className="flex items-center gap-3 flex-1">
                                                <Checkbox
                                                    checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                                                    onCheckedChange={() => handleToggleGroup(group, perms)}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                                <CollapsibleTrigger className="flex items-center gap-2 flex-1 text-left">
                                                    <span className="font-medium">{getGroupLabel(group)}</span>
                                                    <Badge variant={allSelected ? 'default' : 'outline'} className="text-xs">
                                                        {stats.selected}/{stats.total}
                                                    </Badge>
                                                    <ChevronDown
                                                        className={`h-4 w-4 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`}
                                                    />
                                                </CollapsibleTrigger>
                                            </div>
                                        </div>

                                        <CollapsibleContent>
                                            <div className="border-t bg-muted/20 p-3 space-y-2">
                                                {perms.map((perm) => (
                                                    <Label
                                                        key={perm.name}
                                                        className="flex items-start gap-3 p-2 rounded hover:bg-background cursor-pointer text-foreground font-normal leading-normal select-none"
                                                    >
                                                        <Checkbox
                                                            checked={selectedPermissions.includes(perm.name)}
                                                            onCheckedChange={() => handleTogglePermission(perm.name)}
                                                            className="mt-0.5"
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-sm">{getPermissionLabel(perm.name)}</div>
                                                            <div className="text-xs text-muted-foreground font-mono">{perm.name}</div>
                                                        </div>
                                                    </Label>
                                                ))}
                                            </div>
                                        </CollapsibleContent>
                                    </Collapsible>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-4 border-t">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {role ? 'Atualizar' : 'Criar'} Papel
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
