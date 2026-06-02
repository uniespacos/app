import Image from '@/assets/espaco.png'; // Placeholder image for empty previews
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { X } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';
import { FormCadastroValues } from '../CadastroEspaco';
export interface ImageWithPreview {
    file: File;
    preview: string;
}

interface ImageUploadProps {
    imagesWithPreviews: ImageWithPreview[];
    setImagesWithPreviews: React.Dispatch<React.SetStateAction<ImageWithPreview[]>>;
    mainImageIndex: number | undefined;
    setMainImageIndex: (index: number) => void;
    setImagesToDelete: (path: string) => void;
    processing: boolean;
    errors: { imagens?: string };
    setData: ReturnType<typeof useForm<FormCadastroValues>>['setData'];
}

export function ImageUpload({
    imagesWithPreviews,
    setImagesWithPreviews,
    mainImageIndex,
    setData,
    setImagesToDelete,
    processing,
    errors,
    setMainImageIndex,
}: ImageUploadProps) {
    const handleImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newImagePreviews: ImageWithPreview[] = [];
        const newImageFiles: File[] = [];

        Array.from(files).forEach((file) => {
            if (!file.type.startsWith('image/')) {
                toast.warning(`Arquivo ${file.name} não é uma imagem.`);
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.warning(`Arquivo ${file.name} excede o limite de 5MB.`);
                return;
            }
            newImagePreviews.push({ file, preview: URL.createObjectURL(file) });
            newImageFiles.push(file);
        });

        setImagesWithPreviews((prev) => {
            const updatedPreviews = [...prev, ...newImagePreviews];
            setData((prevData) => ({ ...prevData, imagens: updatedPreviews.map((p) => p.file) }));
            if (mainImageIndex === undefined && updatedPreviews.length > 0) {
                setData((prevData) => ({ ...prevData, main_image_index: 0 }));
            }
            return updatedPreviews;
        });
    };

    const handleRemoveImage = (index: number) => {
        const removedImage = imagesWithPreviews[index];
        setImagesToDelete(removedImage.preview);
        URL.revokeObjectURL(removedImage.preview);

        const updatedPreviews = imagesWithPreviews.filter((_, i) => i !== index);
        setImagesWithPreviews(updatedPreviews);
        setData((prevData) => ({ ...prevData, imagens: updatedPreviews.map((p) => p.file) }));

        if (mainImageIndex !== undefined) {
            if (index === mainImageIndex) {
                setData((prevData) => ({ ...prevData, main_image_index: updatedPreviews.length > 0 ? 0 : undefined }));
            } else if (index < mainImageIndex) {
                setData((prevData) => ({ ...prevData, main_image_index: mainImageIndex - 1 }));
            }
        }
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="images">Imagens do Espaço</Label>
                <Input id="images" type="file" accept="image/*" multiple onChange={handleImagesUpload} disabled={processing} />
                {errors.imagens && <p className="mt-1 text-sm text-red-500">{errors.imagens}</p>}
            </div>

            {imagesWithPreviews.length > 0 ? (
                <div className="mt-4">
                    <h4 className="mb-2 text-sm font-medium">Imagens selecionadas:</h4>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                        {imagesWithPreviews.map((img, index) => (
                            <div key={index} className="group relative">
                                <div
                                    className={`aspect-square overflow-hidden rounded-md border ${
                                        mainImageIndex === index ? 'ring-primary border-primary ring-2' : 'bg-slate-50'
                                    }`}
                                >
                                    <img src={img.preview || Image} alt={`Imagem ${index + 1}`} className="h-full w-full object-cover" />
                                    {mainImageIndex === index && (
                                        <div className="bg-primary absolute top-0 left-0 rounded-br px-1.5 py-0.5 text-xs text-white">Principal</div>
                                    )}
                                </div>
                                <div className="absolute -top-2 -right-2 flex gap-1">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="h-6 w-6 rounded-full bg-white shadow-md"
                                        onClick={() => setMainImageIndex(index)}
                                        disabled={processing || mainImageIndex === index}
                                        title="Definir como imagem principal"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="h-3 w-3 text-amber-500"
                                        >
                                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                        </svg>
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="h-6 w-6 rounded-full opacity-90 shadow-md"
                                        onClick={() => handleRemoveImage(index)}
                                        disabled={processing}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <Alert>
                    <AlertDescription>Adicione imagens do espaço. Tamanho máximo: 5MB por imagem.</AlertDescription>
                </Alert>
            )}
        </div>
    );
}
