import GenericHeader from '@/components/generic-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { Andar, Espaco, Modulo, Unidade } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { AddAndarDialog } from '../Espacos/fragments/AddAndarDialog';
import { LocationSelector } from '../Espacos/fragments/LocationSelector';
import { EspacoFormFields } from './fragments/EspacoFormFields';
import { ImageUpload, ImageWithPreview } from './fragments/ImageUpload';

const breadcrumbs = [
    { title: 'Espaço', href: '/institucional/espacos' },
    { title: 'Cadastrar', href: '/espacos/criar' },
];

export interface FormCadastroValues {
    nome: string;
    capacidade_pessoas: number | undefined;
    descricao: string;
    imagens: File[];
    main_image_index: number | undefined;
    unidade_id: number | undefined;
    modulo_id: number | undefined;
    andar_id: number | undefined;
    images_to_delete?: string[];
    [key: string]: string | number | File[] | string[] | undefined;
}

export default function CadastroEspacoPage() {
    const { unidades, modulos, andares, espaco } = usePage<{
        unidades: Unidade[];
        modulos: Modulo[];
        andares: Andar[];
        espaco?: Espaco & {
            andar: Andar & { modulo: Modulo & { unidade: Unidade } };
        };
    }>().props;
    const isEditMode = !!espaco;

    const [imagesWithPreviews, setImagesWithPreviews] = useState<ImageWithPreview[]>(() => {
        if (!isEditMode || !espaco.imagens) return [];
        // No modo de edição, inicializa com as imagens existentes
        return espaco.imagens.map((imgPath) => ({
            file: new File([], imgPath, { type: 'image/*' }), // Create a dummy File object for existing images
            preview: `/storage/${imgPath}`,
            path: imgPath, // Armazena o path relativo para enviar na exclusão
        }));
    });
    const [isAddAndarDialogOpen, setIsAddAndarDialogOpen] = useState(false);

    const { data, setData, post, patch, processing, errors, reset } = useForm<FormCadastroValues>({
        nome: espaco?.nome ?? '',
        capacidade_pessoas: espaco?.capacidade_pessoas ?? undefined,
        descricao: espaco?.descricao ?? '',
        imagens: [],
        main_image_index: espaco?.imagens ? espaco.imagens.findIndex((img) => img === espaco.main_image_index) : 0,
        unidade_id: espaco?.andar?.modulo?.unidade?.id ?? undefined,
        modulo_id: espaco?.andar?.modulo?.id ?? undefined,
        andar_id: espaco?.andar?.id ?? undefined,
    });

    const handleSetMainImage = (index: number) => {
        setData((prevData) => ({ ...prevData, main_image_index: index }));
    };
    const handleImagesToDelete = (path: string) =>
        setData((prevData) => ({ ...prevData, images_to_delete: [...(data.images_to_delete ?? []), path] }));

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditMode) {
            patch(route('institucional.espacos.update', espaco!.id), {
                onSuccess: () => {
                    toast.success(`Espaço ${isEditMode ? 'atualizado' : 'cadastrado'} com sucesso!`);
                    if (!isEditMode) {
                        reset();
                        setImagesWithPreviews([]);
                    }
                },
                onError: (errs) => {
                    toast.error(Object.values(errs)[0] || 'Ocorreu um erro de validação.');
                },
            });
        } else {
            post(route('institucional.espacos.store'), {
                forceFormData: true, // Garante que a requisição seja multipart/form-data
                onSuccess: () => {
                    toast.success(`Espaço ${isEditMode ? 'atualizado' : 'cadastrado'} com sucesso!`);
                    if (!isEditMode) {
                        reset();
                        setImagesWithPreviews([]);
                    }
                },
                onError: (errs) => {
                    toast.error(Object.values(errs)[0] || 'Ocorreu um erro de validação.');
                },
            });
        }
    };
    const pageTitulo = isEditMode ? 'Editar Espaço' : 'Cadastro de Espaço';
    const pageDescricao = isEditMode ? 'Atualize os dados do espaço.' : 'Preencha os dados para cadastrar um novo espaço.';

    const buttonLabel = isEditMode ? 'Salvar Alterações' : 'Cadastrar Espaço';
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={pageTitulo} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="container mx-auto space-y-6 py-6">
                    <div className="container mx-auto space-y-6 p-6">
                        <GenericHeader titulo={pageTitulo} descricao={pageDescricao} />
                        <Dialog open={isAddAndarDialogOpen} onOpenChange={setIsAddAndarDialogOpen}>
                            <Card className="mb-6">
                                <CardContent className="pt-6">
                                    <form onSubmit={onSubmit} className="space-y-6">
                                        <LocationSelector
                                            unidades={unidades}
                                            modulos={modulos}
                                            andares={andares}
                                            unidadeSelecionada={data.unidade_id}
                                            setUnidadeSelecionada={(unidadeSelecionada) =>
                                                setData((prevData) => ({ ...prevData, unidade_id: unidadeSelecionada }))
                                            }
                                            moduloSelecionado={data.modulo_id}
                                            handleModuloChange={(moduloSelecionado) =>
                                                setData((prevData) => ({ ...prevData, modulo_id: moduloSelecionado }))
                                            }
                                            andarSelecionado={data.andar_id}
                                            handleAndarChange={(andarSelecionado) =>
                                                setData((prevData) => ({ ...prevData, andar_id: parseInt(andarSelecionado!, 10) }))
                                            }
                                            processing={processing}
                                            errors={errors}
                                        />
                                        <EspacoFormFields data={data} setData={setData} errors={errors} processing={processing} />
                                        <ImageUpload
                                            imagesWithPreviews={imagesWithPreviews}
                                            setImagesWithPreviews={setImagesWithPreviews}
                                            mainImageIndex={data.main_image_index}
                                            setMainImageIndex={handleSetMainImage}
                                            setData={setData}
                                            setImagesToDelete={handleImagesToDelete}
                                            processing={processing}
                                            errors={errors}
                                        />
                                        <CardFooter className="flex justify-end p-0">
                                            <Button type="submit" disabled={processing}>
                                                {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                {buttonLabel}
                                            </Button>
                                        </CardFooter>
                                    </form>
                                </CardContent>
                            </Card>
                            {data.modulo_id && <AddAndarDialog moduloSelecionado={data.modulo_id} setIsDialogOpen={setIsAddAndarDialogOpen} />}
                        </Dialog>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
