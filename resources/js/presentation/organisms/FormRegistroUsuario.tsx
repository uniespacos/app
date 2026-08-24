import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/presentation/molecules/FormField';
import { SeletorInstituicao } from '@/presentation/molecules/SeletorInstituicao';
import type { Instituicao } from '@/types';
import { LoaderCircle } from 'lucide-react';
import type React from 'react';

interface FormRegistroUsuarioProps {
    data: {
        name: string;
        email: string;
        phone: string;
        password: string;
        password_confirmation: string;
        instituicao_id: string;
        setor_id: string;
    };
    onInputChange: (field: string, value: string) => void;
    errors: Record<string, string>;
    processing: boolean;
    instituicaos: Instituicao[];
    onSubmit: (e: React.SyntheticEvent) => void;
}

export function FormRegistroUsuario({ data, onInputChange, errors, processing, instituicaos, onSubmit }: FormRegistroUsuarioProps) {
    const formatPhoneNumber = (value: string) => {
        const cleaned = value.replace(/\D/g, '');
        const limited = cleaned.slice(0, 11);

        if (limited.length <= 2) {
            return `(${limited}`;
        } else if (limited.length <= 6) {
            return `(${limited.slice(0, 2)}) ${limited.slice(2)}`;
        } else if (limited.length <= 10) {
            return `(${limited.slice(0, 2)}) ${limited.slice(2, 6)}-${limited.slice(6, 10)}`;
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
            <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField label="Nome completo" htmlFor="name" error={errors.name} required>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => {
                                onInputChange('name', e.target.value);
                            }}
                            placeholder="Digite seu nome completo"
                            required
                            disabled={processing}
                            className="h-11"
                        />
                    </FormField>

                    <FormField label="Email" htmlFor="email" error={errors.email} required>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => {
                                onInputChange('email', e.target.value);
                            }}
                            placeholder="seu@email.com"
                            required
                            disabled={processing}
                            className="h-11"
                        />
                    </FormField>
                </div>

                <FormField label="Número de celular" htmlFor="phone" error={errors.phone}>
                    <Input
                        id="phone"
                        value={data.phone}
                        onChange={handlePhoneChange}
                        placeholder="Exemplo: (XX) XXXXX-XXXX"
                        maxLength={15}
                        disabled={processing}
                        className="h-11"
                    />
                </FormField>
            </div>

            <div className="space-y-4">
                <div className="border-t pt-6">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-foreground text-lg font-medium">Informações Institucionais</h3>
                    </div>
                    <SeletorInstituicao
                        instituicaos={instituicaos}
                        processing={processing}
                        onInstituicaoChange={(instId) => {
                            onInputChange('instituicao_id', instId);
                        }}
                        onSetorChange={(setorId) => {
                            onInputChange('setor_id', setorId);
                        }}
                        errors={errors}
                    />
                </div>
            </div>

            <div className="space-y-4">
                <div className="border-t pt-6">
                    <h3 className="text-foreground mb-4 text-lg font-medium">Definir Senha</h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FormField label="Senha" htmlFor="password" error={errors.password} required>
                            <Input
                                id="password"
                                type="password"
                                value={data.password}
                                onChange={(e) => {
                                    onInputChange('password', e.target.value);
                                }}
                                placeholder="Mínimo 8 caracteres"
                                required
                                disabled={processing}
                                className="h-11"
                            />
                        </FormField>

                        <FormField label="Confirme sua senha" htmlFor="password_confirmation" error={errors.password_confirmation} required>
                            <Input
                                id="password_confirmation"
                                type="password"
                                value={data.password_confirmation}
                                onChange={(e) => {
                                    onInputChange('password_confirmation', e.target.value);
                                }}
                                placeholder="Digite a senha novamente"
                                required
                                disabled={processing}
                                className="h-11"
                            />
                        </FormField>
                    </div>
                </div>
            </div>

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
