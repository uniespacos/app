import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Head } from '@inertiajs/react';
import { Building2, Link, Settings, Users } from 'lucide-react';
import { Button } from 'react-day-picker';

export default function Home() {
    return (
        <div className="container mx-auto py-8">
            <Head title="Painel Administrativo" />
            <div className="mb-8 text-center">
                <h1 className="mb-4 text-4xl font-bold">Sistema de Gestão Organizacional</h1>
                <p className="text-muted-foreground text-xl">Gerencie instituições, unidades e setores de forma integrada</p>
            </div>

            <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
                <Card className="transition-shadow hover:shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5" />
                            Setores
                        </CardTitle>
                        <CardDescription>Gerencie os setores das unidades organizacionais</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href={route('institucional.setores.index')}>
                            <Button className="w-full">Acessar Setores</Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="opacity-50 transition-shadow hover:shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Usuários
                        </CardTitle>
                        <CardDescription>Gerencie usuários e suas vinculações</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full" disabled>
                            Em breve
                        </Button>
                    </CardContent>
                </Card>

                <Card className="opacity-50 transition-shadow hover:shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5" />
                            Configurações
                        </CardTitle>
                        <CardDescription>Configurações gerais do sistema</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full" disabled>
                            Em breve
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
