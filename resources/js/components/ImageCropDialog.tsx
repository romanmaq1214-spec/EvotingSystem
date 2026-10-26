import React, { useEffect, useRef, useState } from 'react';
import { Crop, X } from 'lucide-react';

interface Props {
    file: File;
    onCancel: () => void;
    onApply: (croppedFile: File) => void;
}

export default function ImageCropDialog({ file, onCancel, onApply }: Props) {
    const [imageUrl, setImageUrl] = useState('');
    const [horizontal, setHorizontal] = useState(50);
    const [vertical, setVertical] = useState(50);
    const [zoom, setZoom] = useState(1);
    const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');
    const cropFrameRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const url = URL.createObjectURL(file);
        setImageUrl(url);
        setImageSize(null);
        setHorizontal(50);
        setVertical(50);
        setZoom(1);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    const aspectRatio = imageSize ? imageSize.width / imageSize.height : 1;
    const containedWidth = Math.min(1, aspectRatio);
    const containedHeight = Math.min(1, 1 / aspectRatio);
    const cropFrameFactor = Math.min(containedWidth, containedHeight);
    const maxHorizontalPan = Math.max(0, (containedWidth * zoom - cropFrameFactor) / 2);
    const maxVerticalPan = Math.max(0, (containedHeight * zoom - cropFrameFactor) / 2);

    const applyCrop = () => {
        if (!imageUrl) return;

        setProcessing(true);
        setError('');

        const image = new Image();
        image.onload = () => {
            const previewSize = cropFrameRef.current?.clientWidth || 320;
            const outputSize = 512;
            const scale = Math.min(previewSize / image.naturalWidth, previewSize / image.naturalHeight);
            const renderedWidth = image.naturalWidth * scale;
            const renderedHeight = image.naturalHeight * scale;
            const cropSize = Math.min(renderedWidth, renderedHeight);
            const cropLeft = (previewSize - cropSize) / 2;
            const cropTop = (previewSize - cropSize) / 2;
            const offsetX = (previewSize - renderedWidth) / 2;
            const offsetY = (previewSize - renderedHeight) / 2;
            const maxPanX = Math.max(0, (renderedWidth * zoom - cropSize) / 2);
            const maxPanY = Math.max(0, (renderedHeight * zoom - cropSize) / 2);
            const panX = ((50 - horizontal) / 50) * maxPanX;
            const panY = ((50 - vertical) / 50) * maxPanY;
            const zoomedLeft = previewSize / 2 + panX + zoom * (offsetX - previewSize / 2);
            const zoomedTop = previewSize / 2 + panY + zoom * (offsetY - previewSize / 2);
            const sourceSize = cropSize / (scale * zoom);
            const sourceX = Math.min(image.naturalWidth - sourceSize, Math.max(0, (cropLeft - zoomedLeft) / (scale * zoom)));
            const sourceY = Math.min(image.naturalHeight - sourceSize, Math.max(0, (cropTop - zoomedTop) / (scale * zoom)));
            const canvas = document.createElement('canvas');
            canvas.width = outputSize;
            canvas.height = outputSize;

            const context = canvas.getContext('2d');
            if (!context) {
                setProcessing(false);
                setError('Could not prepare the crop. Please try another image.');
                return;
            }

            context.drawImage(image, sourceX, sourceY, sourceSize, sourceSize, 0, 0, outputSize, outputSize);
            canvas.toBlob((blob) => {
                setProcessing(false);
                if (!blob) {
                    setError('Could not create the cropped image. Please try again.');
                    return;
                }

                const baseName = file.name.replace(/\.[^.]+$/, '') || 'candidate-image';
                onApply(new File([blob], `${baseName}-cropped.png`, { type: 'image/png' }));
            }, 'image/png');
        };
        image.onerror = () => {
            setProcessing(false);
            setError('This image could not be opened. Please choose another file.');
        };
        image.src = imageUrl;
    };

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-sm"
            onClick={onCancel}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="candidate-image-crop-title"
                className="my-auto w-full max-w-xl rounded-2xl border border-white/20 bg-white p-5 shadow-2xl sm:p-6"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                        <h2 id="candidate-image-crop-title" className="text-base font-bold text-slate-900">Crop candidate image</h2>
                        <p className="mt-1 text-xs text-slate-500">The full original is shown. The shaded area falls outside the square crop.</p>
                    </div>
                    <button type="button" onClick={onCancel} aria-label="Close image crop" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="mt-5 flex justify-center">
                    <div ref={cropFrameRef} className="relative aspect-square w-full max-w-xs overflow-hidden rounded-xl bg-slate-200 ring-1 ring-slate-300">
                        {imageUrl && (
                            <img
                                src={imageUrl}
                                alt="Crop preview"
                                draggable={false}
                                onLoad={(event) => setImageSize({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })}
                                className="h-full w-full select-none object-contain"
                                style={{
                                    objectPosition: '50% 50%',
                                    transform: `translate(${((50 - horizontal) / 50) * maxHorizontalPan * 100}%, ${((50 - vertical) / 50) * maxVerticalPan * 100}%) scale(${zoom})`,
                                }}
                            />
                        )}
                        {imageSize && (
                            <div
                                className="pointer-events-none absolute left-1/2 top-1/2 aspect-square -translate-x-1/2 -translate-y-1/2 border-2 border-white shadow-[0_0_0_999px_rgba(15,23,42,0.45)]"
                                style={{ width: `${cropFrameFactor * 100}%` }}
                            />
                        )}
                    </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <label className="text-xs font-semibold text-slate-600">
                        Horizontal
                        <input type="range" min="0" max="100" value={horizontal} disabled={maxHorizontalPan === 0} onChange={(event) => setHorizontal(Number(event.target.value))} className="mt-2 block w-full accent-indigo-600 disabled:opacity-40" />
                    </label>
                    <label className="text-xs font-semibold text-slate-600">
                        Vertical
                        <input type="range" min="0" max="100" value={vertical} disabled={maxVerticalPan === 0} onChange={(event) => setVertical(Number(event.target.value))} className="mt-2 block w-full accent-indigo-600 disabled:opacity-40" />
                    </label>
                    <label className="text-xs font-semibold text-slate-600">
                        Zoom
                        <input type="range" min="1" max="3" step="0.05" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} className="mt-2 block w-full accent-indigo-600" />
                    </label>
                </div>

                {error && <p role="alert" className="mt-3 text-xs font-medium text-rose-600">{error}</p>}

                <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4">
                    <button type="button" onClick={onCancel} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                        Cancel
                    </button>
                    <button type="button" onClick={applyCrop} disabled={!imageUrl || processing} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 disabled:opacity-50">
                        <Crop className="h-4 w-4" />
                        {processing ? 'Cropping...' : 'Apply crop'}
                    </button>
                </div>
            </div>
        </div>
    );
}
