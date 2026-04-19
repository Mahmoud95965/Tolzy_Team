"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';


import { useEffect, useState, useRef } from 'react';
import {
    Image as ImageIcon,
    Loader,
    Bold,
    Italic,
    Link as LinkIcon,
    Unlink,
    List,
    ListOrdered
} from 'lucide-react';

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
}

// Define extensions outside component to prevent re-instantiation issues
const EXTENSIONS = [
    StarterKit.configure({
        heading: {
            levels: [1, 2, 3],
        },
    }),
    Underline,
    Image,
    Link.configure({
        openOnClick: false,
        HTMLAttributes: {
            class: 'text-indigo-600 hover:text-indigo-800 underline transition-colors cursor-pointer',
        },
    }),
    TextAlign.configure({
        types: ['heading', 'paragraph'],
    }),
    TextStyle,
];

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) {
        return null;
    }

    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);

        // cancelled
        if (url === null) {
            return;
        }

        // empty
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        // update link
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    return (
        <div className="flex flex-wrap items-center gap-1 p-2 border-b border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50">
            <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                className={`p-2 rounded-lg transition-colors ${editor.isActive('bold') ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'}`}
                title="عريض"
            >
                <Bold className="w-4 h-4" />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                className={`p-2 rounded-lg transition-colors ${editor.isActive('italic') ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'}`}
                title="مائل"
            >
                <Italic className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1"></div>

            <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-2 rounded-lg transition-colors ${editor.isActive('bulletList') ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'}`}
                title="قائمة نقطية"
            >
                <List className="w-4 h-4" />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`p-2 rounded-lg transition-colors ${editor.isActive('orderedList') ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'}`}
                title="قائمة رقمية"
            >
                <ListOrdered className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1"></div>

            <button
                onClick={setLink}
                className={`p-2 rounded-lg transition-colors ${editor.isActive('link') ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'}`}
                title="إضافة رابط"
            >
                <LinkIcon className="w-4 h-4" />
            </button>
            <button
                onClick={() => editor.chain().focus().unsetLink().run()}
                disabled={!editor.isActive('link')}
                className="p-2 rounded-lg transition-colors hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 disabled:opacity-30"
                title="إزالة الرابط"
            >
                <Unlink className="w-4 h-4" />
            </button>
        </div>
    );
};

export const RichTextEditor = ({ content, onChange }: RichTextEditorProps) => {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const editor = useEditor({
        immediatelyRender: false,
        extensions: EXTENSIONS,
        content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose dark:prose-invert prose-indigo max-w-none focus:outline-none min-h-[300px] p-6 text-slate-900 dark:text-slate-100 text-lg leading-relaxed font-arabic placeholder:text-slate-400',
            },
        },
    });

    // Update editor content if passed content changes externally (e.g. from parent state reset)
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            if (editor.isEmpty) {
                editor.commands.setContent(content);
            }
        }
    }, [content, editor]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !editor) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/articles/upload-image', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (response.ok && data.url) {
                editor.chain().focus().setImage({ src: data.url }).run();
            } else {
                alert(data.error || 'فشل رفع الصورة');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('حدث خطأ أثناء رفع الصورة');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div className="w-full border-2 border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 overflow-hidden focus-within:border-indigo-500 dark:focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all shadow-sm">
            <MenuBar editor={editor} />

            <EditorContent editor={editor} className="cursor-text" />

            {/* Footer with Actions */}
            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-500 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300 font-medium shadow-sm disabled:opacity-50"
                    >
                        {uploading ? (
                            <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                            <ImageIcon className="w-4 h-4" />
                        )}
                        <span>{uploading ? 'جارٍ الرفع...' : 'إدراج صورة'}</span>
                    </button>
                    <span className="text-slate-400 hidden sm:inline">|</span>
                    <span className="hidden sm:inline">يمكنك أيضاً نسخ ولصق الصور مباشرة</span>
                </div>
                <div className="hidden sm:block">
                    تنسيق تلقائي للفقرات
                </div>
            </div>
        </div>
    );
};
