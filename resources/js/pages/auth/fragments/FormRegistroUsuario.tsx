import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Instituicao } from '@/types';
import { LoaderCircle } from 'lucide-react';
import type React from 'react';
import { SeletorInstituicao } from './SeletorInstituicao';

interface FormRegistroUsuarioProps {
    data: {
        name: string;
        email: string;
        phone: string;
        password: string;
        password_confirmation: string;
        setor_id: string;
    };
    onInputChange: (field: string, value: string) => void;
    errors: Record<string, string>;
    processing: boolean;
    instituicaos: Instituicao[];
    onSubmit: (e: React.FormEvent) => void;
    onOpenNewInstitutionModal: () => void;
}

export function FormRegistroUsuario({
    data,
    onInputChange,
    errors,
    processing,
    instituicaos,
    onSubmit,
    onOpenNewInstitutionModal,
}: FormRegistroUsuarioProps) {
    const formatPhoneNumber = (value: string) => {
        const cleaned = value.replace(/\D/g, '');
        const limited = cleaned.slice(0, 11);

        if (limited.length <= 2) {
            return `(${limited}`;
        } else if (limited.length <= 7) {
            return `(${limited.slice(0, 2)}) ${limited.slice(2)}`;
        } else {
            return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7, 11)}`;
        }
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhoneNumber(e.target.value);
        onInputChange('phone', formatted);
    };

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome completo *</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => onInputChange('name', e.target.value)}
                            placeholder="Digite seu nome completo"
                            required
                            className="h-11"
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => onInputChange('email', e.target.value)}
                            placeholder="seu@email.com"
                            required
                            className="h-11"
                        />
                        <InputError message={errors.email} />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="phone">Número de celular *</Label>
                    <Input
                        id="phone"
                        value={data.phone}
                        onChange={handlePhoneChange}
                        placeholder="(73) 99999-9999"
                        required
                        maxLength={15}
                        className="h-11"
                    />
                    <InputError message={errors.phone} />
                </div>
            </div>

            {/* Institution Selection */}
            <div className="space-y-4">
                <div className="border-t pt-6">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">Informações Institucionais</h3>
                    </div>
                    <SeletorInstituicao
                        instituicaos={instituicaos}
                        processing={processing}
                        onSetorChange={(setorId) => onInputChange('setor_id', setorId)}
                        errors={errors}
                    />
                </div>
            </div>

            {/* Password */}
            <div className="space-y-4">
                <div className="border-t pt-6">
                    <h3 className="mb-4 text-lg font-medium text-gray-900">Definir Senha</h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="password">Senha *</Label>
                            <Input
                                id="password"
                                type="password"
                                value={data.password}
                                onChange={(e) => onInputChange('password', e.target.value)}
                                placeholder="Mínimo 8 caracteres"
                                required
                                className="h-11"
                            />
                            <InputError message={errors.password} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password_confirmation">Confirme sua senha *</Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                value={data.password_confirmation}
                                onChange={(e) => onInputChange('password_confirmation', e.target.value)}
                                placeholder="Digite a senha novamente"
                                required
                                className="h-11"
                            />
                            <InputError message={errors.password_confirmation} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
                <Button type="submit" className="h-12 w-full text-base font-medium" disabled={processing}>
                    {processing ? (
                        <>
                            <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
                            Criando conta...
                        </>
                    ) : (
                        'Criar conta'
                    )}
                </Button>
            </div>
        </form>
    );
}
