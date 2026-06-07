import React from 'react';

type RenderableNode = Record<string, unknown> & { type: string };
type RenderableMark = Record<string, unknown> & { type: string };

interface RichTextRendererProps {
  content: RenderableNode;
}

function renderMarks(marks: RenderableMark[] | undefined, children: React.ReactNode): React.ReactNode {
  if (!marks || marks.length === 0) return children;
  let result = children;
  for (const mark of marks) {
    if (mark.type === 'bold') result = <strong>{result}</strong>;
    else if (mark.type === 'italic') result = <em>{result}</em>;
    else if (mark.type === 'link') {
      const href = (mark.attrs as Record<string, string>)?.href || '#';
      const isExternal = href.startsWith('http');
      result = (
        <a
          href={href}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          className="text-[#1A2B4C] underline hover:text-orange-600 transition-colors"
        >
          {result}
        </a>
      );
    }
  }
  return result;
}

function renderNode(node: RenderableNode, index: number): React.ReactNode {
  const key = `${node.type}-${index}`;
  const content = node.content as RenderableNode[] | undefined;

  switch (node.type) {
    case 'doc':
      return (
        <div key={key}>
          {content?.map((child, i) => renderNode(child, i))}
        </div>
      );

    case 'paragraph':
      return (
        <p key={key} className="mb-4 leading-relaxed text-slate-700">
          {content?.map((child, i) => renderNode(child, i))}
        </p>
      );

    case 'heading': {
      const level = (node.attrs as Record<string, number>)?.level || 2;
      const HeadingTag = `h${Math.min(level, 3)}` as keyof JSX.IntrinsicElements;
      const className = level === 2
        ? 'text-2xl font-black text-[#1A2B4C] mt-8 mb-4'
        : 'text-xl font-bold text-slate-800 mt-6 mb-3';
      return React.createElement(
        HeadingTag,
        { key, className },
        content?.map((child, i) => renderNode(child, i)),
      );
    }

    case 'text':
      return renderMarks(node.marks as RenderableMark[], node.text as string);

    case 'bulletList':
      return (
        <ul key={key} className="list-disc pl-6 mb-4 space-y-1 text-slate-700">
          {content?.map((child, i) => renderNode(child, i))}
        </ul>
      );

    case 'orderedList':
      return (
        <ol key={key} className="list-decimal pl-6 mb-4 space-y-1 text-slate-700">
          {content?.map((child, i) => renderNode(child, i))}
        </ol>
      );

    case 'listItem':
      return (
        <li key={key} className="leading-relaxed">
          {content?.map((child, i) => renderNode(child, i))}
        </li>
      );

    case 'blockquote':
      return (
        <blockquote key={key} className="border-l-4 border-[#E5C37A] bg-amber-50 px-4 py-3 mb-4 italic text-slate-600 rounded-r-md">
          {content?.map((child, i) => renderNode(child, i))}
        </blockquote>
      );

    case 'image': {
      const attrs = node.attrs as Record<string, string>;
      return (
        <figure key={key} className="mb-4">
          <img
            src={attrs?.src || ''}
            alt={attrs?.alt || ''}
            className="w-full h-auto rounded-lg"
            loading="lazy"
          />
        </figure>
      );
    }

    case 'hardBreak':
      return <br key={key} />;

    default:
      return null;
  }
}

export function RichTextRenderer({ content }: RichTextRendererProps) {
  if (!content || content.type !== 'doc') return null;
  return <>{renderNode(content, 0)}</>;
}
