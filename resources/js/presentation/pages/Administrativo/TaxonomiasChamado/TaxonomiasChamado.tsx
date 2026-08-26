import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TabelaTaxonomiaChamado, TaxonomiaChamado } from '@/presentation/organisms/TabelaTaxonomiaChamado';
import { TaxonomiaChamadoForm, TaxonomiaChamadoFormData } from '@/presentation/organisms/TaxonomiaChamadoForm';
import AppLayout from '@/presentation/templates/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { PlusCircle } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs = [
    {
        title: 'Tipos e Categorias',
        href: '/institucional/taxonomias-chamado',
    },
];

type Aba = 'tipos' | 'categorias';

export default function TaxonomiasChamadoPage() {
    const { tipos, categorias, errors } = usePage<{
        tipos: TaxonomiaChamado[];
        categorias: TaxonomiaChamado[];
        errors: Record<string, string>;
    }>().props;

    const [aba, setAba] = useState<Aba>('tipos');
    const [criando, setCriando] = useState(false);
    const [editando, setEditando] = useState<TaxonomiaChamado | null>(null);
    const [removendo, setRemovendo] = useState<TaxonomiaChamado | null>(null);
    const [processing, setProcessing] = useState(false);

    const fecharModais = () => {
        setCriando(false);
        setEditando(null);
        setProcessing(false);
    };

    const criar = (data: TaxonomiaChamadoFormData) => {
        setProcessing(true);
        router.post(
            route(`institucional.taxonomias-chamado.${aba}.store`),
            { ...data },
            { onSuccess: fecharModais, onFinish: () => setProcessing(false) },
        );
    };

    const atualizar = (data: TaxonomiaChamadoFormData) => {
        if (!editando) return;

        setProcessing(true);
        router.put(
            route(`institucional.taxonomias-chamado.${aba}.update`, aba === 'tipos' ? { tipo: editando.id } : { categoria: editando.id }),
            { ...data },
            { onSuccess: fecharModais, onFinish: () => setProcessing(false) },
        );
    };

    const remover = () => {
        if (!removendo) return;

        router.delete(
            route(`institucional.taxonomias-chamado.${aba}.destroy`, aba === 'tipos' ? { tipo: removendo.id } : { categoria: removendo.id }),
            { onSuccess: () => setRemovendo(null) },
        );
    };

    const ehTipo = aba === 'tipos';
    const singular = ehTipo ? 'tipo' : 'categoria';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tipos e Categorias de Chamado" />

            <div className="space-y-6 p-4">
                <header className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold">Tipos e Categorias</h1>
                        <p className="text-muted-foreground text-sm">Controlam as opções oferecidas a quem registra algo pelo QR Code do espaço.</p>
                    </div>
                    <Button onClick={() => setCriando(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Novo {singular}
                    </Button>
                </header>

                <Tabs value={aba} onValueChange={(valor) => setAba(valor as Aba)}>
                    <TabsList className="grid w-full max-w-md grid-cols-2">
                        <TabsTrigger value="tipos">Tipos ({tipos.length})</TabsTrigger>
                        <TabsTrigger value="categorias">Categorias ({categorias.length})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="tipos" className="mt-4">
                        <TabelaTaxonomiaChamado
                            itens={tipos}
                            comAlerta
                            vazioTexto="Nenhum tipo cadastrado. Sem ao menos um tipo e uma categoria, o formulário público fica indisponível."
                            onEdit={setEditando}
                            onDelete={setRemovendo}
                        />
                    </TabsContent>

                    <TabsContent value="categorias" className="mt-4">
                        <TabelaTaxonomiaChamado
                            itens={categorias}
                            comAlerta={false}
                            vazioTexto="Nenhuma categoria cadastrada. Sem ao menos um tipo e uma categoria, o formulário público fica indisponível."
                            onEdit={setEditando}
                            onDelete={setRemovendo}
                        />
                    </TabsContent>
                </Tabs>
            </div>

            <Dialog open={criando} onOpenChange={(aberto) => !aberto && fecharModais()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Novo {singular}</DialogTitle>
                        <DialogDescription>A opção passa a aparecer no formulário público assim que for salva.</DialogDescription>
                    </DialogHeader>
                    <TaxonomiaChamadoForm comAlerta={ehTipo} errors={errors} processing={processing} onSubmit={criar} onCancel={fecharModais} />
                </DialogContent>
            </Dialog>

            <Dialog open={editando !== null} onOpenChange={(aberto) => !aberto && fecharModais()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar {singular}</DialogTitle>
                        <DialogDescription>Os chamados já registrados passam a exibir o novo nome.</DialogDescription>
                    </DialogHeader>
                    <TaxonomiaChamadoForm
                        taxonomia={
                            editando
                                ? {
                                      nome: editando.nome,
                                      slug: editando.slug,
                                      descricao: editando.descricao ?? '',
                                      ordem: editando.ordem,
                                      exibe_alerta_espaco: editando.exibe_alerta_espaco,
                                  }
                                : null
                        }
                        comAlerta={ehTipo}
                        errors={errors}
                        processing={processing}
                        onSubmit={atualizar}
                        onCancel={fecharModais}
                    />
                </DialogContent>
            </Dialog>

            <AlertDialog open={removendo !== null} onOpenChange={(aberto) => !aberto && setRemovendo(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remover {removendo?.nome}?</AlertDialogTitle>
                        <AlertDialogDescription>
                            A opção some dos formulários novos, mas continua aparecendo nos chamados já registrados. Se este for o último {singular}{' '}
                            da lista, o formulário público fica indisponível até que outro seja cadastrado.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={remover}>Remover</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
