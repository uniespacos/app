import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { PlusCircle } from 'lucide-react';

type HeaderEspacoProps = {
    isGerenciarEspacos?: boolean;
    titulo: string;
    descricao: string;
};

export default function EspacoHeader({ isGerenciarEspacos, titulo, descricao }: HeaderEspacoProps) {
    return (
        <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">{titulo}</h1>
                <p className="text-muted-foreground">{descricao}</p>
            </div>
            {isGerenciarEspacos && (
                <Link href={route('institucional.espacos.create')}>
                    <Button className="flex items-center gap-2">
                        <PlusCircle className="h-4 w-4" />
                        Cadastrar Espaço
                    </Button>
                </Link>
            )}
        </header>
    );
}
