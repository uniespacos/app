import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Plus } from 'lucide-react';

interface Props {
    onCreateSetor: () => void;
}

export function HeaderSetor({ onCreateSetor }: Props) {
    return (
        <>
            {/* Back Button */}
            <div className="flex items-center gap-4">
                <Link href="/">
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar
                    </Button>
                </Link>
            </div>

            {/* Header */}
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-3xl font-bold">Gerenciar Setores</h1>
                    <p className="text-muted-foreground">Gerencie os setores das unidades organizacionais</p>
                </div>
                <Button onClick={onCreateSetor} className="w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Setor
                </Button>
            </div>
        </>
    );
}
