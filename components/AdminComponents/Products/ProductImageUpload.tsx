// components/AdminComponents/Products/ProductImageUpload.tsx

'use client';

import { upload } from '@vercel/blob/client';
import {
    ChangeEvent,
    useRef,
    useState,
} from 'react';

type ProductImageUploadProps = {
    initialImageUrl?: string;
    error?: string;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_CONTENT_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
];

function sanitizeFilename(filename: string): string {
    const filenameWithoutExtension = filename.replace(
        /\.[^/.]+$/,
        '',
    );

    const extension =
        filename.split('.').pop()?.toLowerCase() ?? 'jpg';

    const sanitizedName = filenameWithoutExtension
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    return `${sanitizedName || 'produto'}.${extension}`;
}

export default function ProductImageUpload({
    initialImageUrl = '',
    error,
}: ProductImageUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    const [imageUrl, setImageUrl] =
        useState(initialImageUrl);

    const [uploadError, setUploadError] =
        useState('');

    const [isUploading, setIsUploading] =
        useState(false);

    async function handleFileChange(
        event: ChangeEvent<HTMLInputElement>,
    ): Promise<void> {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        setUploadError('');

        if (!ALLOWED_CONTENT_TYPES.includes(file.type)) {
            setUploadError(
                'Selecione uma imagem JPG, PNG ou WebP.',
            );

            event.target.value = '';
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            setUploadError(
                'A imagem deve ter no máximo 5 MB.',
            );

            event.target.value = '';
            return;
        }

        try {
            setIsUploading(true);

            const filename = sanitizeFilename(file.name);

            const blob = await upload(
                `products/${filename}`,
                file,
                {
                    access: 'public',

                    handleUploadUrl:
                        '/api/products/upload',
                },
            );

            setImageUrl(blob.url);
        } catch (uploadException) {
            console.error(
                'Erro ao enviar imagem:',
                uploadException,
            );

            setUploadError(
                'Não foi possível enviar a imagem. Tente novamente.',
            );
        } finally {
            setIsUploading(false);

            if (inputRef.current) {
                inputRef.current.value = '';
            }
        }
    }

    function handleRemoveImage(): void {
        setImageUrl('');
        setUploadError('');

        if (inputRef.current) {
            inputRef.current.value = '';
        }
    }

    return (
        <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
                Imagem do produto
            </label>

            <input
                type="hidden"
                name="image_url"
                value={imageUrl}
            />

            <div className="rounded-xl border border-slate-200 p-4">
                {imageUrl ? (
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="relative h-40 w-full overflow-hidden rounded-xl bg-slate-100 sm:size-40 sm:shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={imageUrl}
                                alt="Prévia do produto"
                                className="size-full object-contain"
                            />
                        </div>

                        <div className="flex flex-1 flex-col items-start gap-3">
                            <div>
                                <p className="text-sm font-semibold text-slate-900">
                                    Imagem selecionada
                                </p>

                                <p className="mt-1 break-all text-xs text-slate-500">
                                    {imageUrl}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <label
                                    className={`inline-flex min-h-10 cursor-pointer items-center justify-center rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 ${isUploading
                                        ? 'pointer-events-none opacity-50'
                                        : ''
                                        }`}
                                >
                                    Trocar imagem

                                    <input
                                        ref={inputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={
                                            handleFileChange
                                        }
                                        disabled={isUploading}
                                        className="sr-only"
                                    />
                                </label>

                                <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    disabled={isUploading}
                                    className="min-h-10 rounded-xl px-4 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Remover
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <label
                        className={`flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:border-slate-400 hover:bg-slate-100 ${isUploading
                            ? 'pointer-events-none opacity-60'
                            : ''
                            }`}
                    >
                        <span className="text-sm font-semibold text-slate-800">
                            {isUploading
                                ? 'Enviando imagem...'
                                : 'Selecionar imagem'}
                        </span>

                        <span className="mt-2 text-xs text-slate-500">
                            JPG, PNG ou WebP de até 5 MB
                        </span>

                        <input
                            ref={inputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleFileChange}
                            disabled={isUploading}
                            className="sr-only"
                        />
                    </label>
                )}
            </div>

            {isUploading && (
                <p
                    className="mt-2 text-sm text-slate-500"
                    role="status"
                >
                    Aguarde enquanto a imagem é enviada.
                </p>
            )}

            {(uploadError || error) && (
                <p
                    className="mt-2 text-sm text-red-600"
                    role="alert"
                >
                    {uploadError || error}
                </p>
            )}
        </div>
    );
}