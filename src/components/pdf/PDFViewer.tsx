"use client";

import { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Loader } from 'lucide-react';

// Configure PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

interface PDFViewerProps {
    url: string;
}

export default function PDFViewer({ url }: PDFViewerProps) {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [pageWidth, setPageWidth] = useState<number>(800);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new ResizeObserver((entries) => {
            if (entries[0]) {
                // Set width to container width, subtracting a small amount to prevent horizontal scroll
                setPageWidth(entries[0].contentRect.width);
            }
        });

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, []);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
        setLoading(false);
    }

    return (
        <div ref={containerRef} className="w-full flex flex-col items-center bg-white dark:bg-slate-800/50">
            {loading && (
                <div className="flex flex-col items-center justify-center p-12">
                    <Loader className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
                    <p className="text-slate-600 dark:text-slate-400">جارٍ تحميل الملف...</p>
                </div>
            )}

            <Document
                file={url}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={null} // Handled by custom loader above/state
                className="w-full flex flex-col items-center"
                error={
                    <div className="text-center p-8 text-red-500">
                        فشل تحميل ملف PDF. يرجى المحاولة مرة أخرى أو تحميل الملف.
                    </div>
                }
            >
                {numPages && Array.from(new Array(numPages), (_, index) => (
                    <div key={`page_${index + 1}`} className="mb-4 shadow-lg overflow-hidden rounded-sm bg-white">
                        <Page
                            pageNumber={index + 1}
                            width={pageWidth}
                            renderTextLayer={true}
                            renderAnnotationLayer={true}
                            loading={
                                <div className="animate-pulse bg-slate-200 h-[1000px] w-full" style={{ width: pageWidth }}></div>
                            }
                        />
                    </div>
                ))}
            </Document>
        </div>
    );
}
