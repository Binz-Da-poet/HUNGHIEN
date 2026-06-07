'use client';

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import LinkExtension from '@tiptap/extension-link';
import ImageExtension from '@tiptap/extension-image';
import {
  Bold, Italic, List, ListOrdered, Quote, Link2, Image as ImageIcon,
  Heading2, Heading3, Undo2, Redo2, Pilcrow,
} from 'lucide-react';

interface RichTextEditorProps {
  content?: Record<string, unknown>;
  onChange: (json: Record<string, unknown>) => void;
}

export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer' },
      }),
      ImageExtension,
    ],
    content: content as any,
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getJSON());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] px-4 py-3',
      },
    },
    immediatelyRender: false,
  });

  if (!editor) {
    return <div className="h-[200px] rounded-md border border-slate-200 bg-slate-50 animate-pulse" />;
  }

  const addImage = () => {
    const url = window.prompt('Nhập URL ảnh:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addLink = () => {
    const currentUrl = editor.getAttributes('link').href || '';
    const url = window.prompt('Nhập URL liên kết:', currentUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().setLink({ href: url }).run();
  };

  const ToolButton = ({ onClick, active, children, title }: {
    onClick: () => void; active?: boolean; children: React.ReactNode; title: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded hover:bg-slate-200 transition-colors ${active ? 'bg-slate-200 text-[#1A2B4C]' : 'text-slate-600'}`}
    >
      {children}
    </button>
  );

  return (
    <div className="border border-slate-200 rounded-md overflow-hidden">
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-0.5 pr-2 border-r border-slate-200 mr-2">
          <ToolButton title="Đoạn văn" onClick={() => editor.chain().focus().setParagraph().run()}><Pilcrow className="h-4 w-4" /></ToolButton>
          <ToolButton title="Heading 2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })}><Heading2 className="h-4 w-4" /></ToolButton>
          <ToolButton title="Heading 3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })}><Heading3 className="h-4 w-4" /></ToolButton>
        </div>
        <div className="flex items-center gap-0.5 pr-2 border-r border-slate-200 mr-2">
          <ToolButton title="In đậm" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}><Bold className="h-4 w-4" /></ToolButton>
          <ToolButton title="In nghiêng" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}><Italic className="h-4 w-4" /></ToolButton>
          <ToolButton title="Liên kết" onClick={addLink} active={editor.isActive('link')}><Link2 className="h-4 w-4" /></ToolButton>
        </div>
        <div className="flex items-center gap-0.5 pr-2 border-r border-slate-200 mr-2">
          <ToolButton title="Danh sách gạch dòng" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}><List className="h-4 w-4" /></ToolButton>
          <ToolButton title="Danh sách số" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}><ListOrdered className="h-4 w-4" /></ToolButton>
          <ToolButton title="Trích dẫn" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')}><Quote className="h-4 w-4" /></ToolButton>
        </div>
        <div className="flex items-center gap-0.5 pr-2 border-r border-slate-200 mr-2">
          <ToolButton title="Ảnh" onClick={addImage}><ImageIcon className="h-4 w-4" /></ToolButton>
        </div>
        <div className="flex items-center gap-0.5">
          <ToolButton title="Undo" onClick={() => editor.chain().focus().undo().run()}><Undo2 className="h-4 w-4" /></ToolButton>
          <ToolButton title="Redo" onClick={() => editor.chain().focus().redo().run()}><Redo2 className="h-4 w-4" /></ToolButton>
        </div>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
