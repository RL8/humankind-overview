"use client";

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn("prose prose-green max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-3xl font-bold text-foreground font-serif mb-6 pb-3 border-b-4 border-primary">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl font-semibold text-foreground font-serif mt-8 mb-4 pb-2 border-b-2 border-border">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-semibold text-foreground font-serif mt-6 mb-3">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-lg font-medium text-foreground font-serif mt-4 mb-2">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="text-foreground leading-relaxed mb-4 text-justify">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-6 mb-4 space-y-2 text-foreground">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-6 mb-4 space-y-2 text-foreground">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-foreground">
              {children}
            </li>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-6">
              <table className="w-full border-collapse bg-card rounded-lg shadow-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-primary text-primary-foreground">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="px-4 py-3 text-left font-semibold border border-primary/20">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-3 border border-border text-foreground">
              {children}
            </td>
          ),
          tr: ({ children, ...props }) => (
            <tr className="hover:bg-muted/50 transition-colors" {...props}>
              {children}
            </tr>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary bg-accent/20 pl-6 py-4 my-6 italic text-foreground rounded-r-lg">
              {children}
            </blockquote>
          ),
          code: ({ children, className }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="bg-muted px-2 py-1 rounded font-mono text-sm text-foreground">
                  {children}
                </code>
              );
            }
            return (
              <code className="block bg-muted p-4 rounded-lg font-mono text-sm text-foreground overflow-x-auto">
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto my-4">
              {children}
            </pre>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-foreground">
              {children}
            </em>
          ),
          hr: () => (
            <hr className="border-border my-8" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
