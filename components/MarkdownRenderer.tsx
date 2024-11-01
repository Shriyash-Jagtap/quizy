
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-children-prop */
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';  
import 'katex/dist/katex.min.css';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MarkdownRendererProps {
  content: string;
  className?: string; 
}


interface CodeBlockProps {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const allowedImageDomains = ['i.imgur.com']; 

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className }) => {
  return (
    <div className={className}>
      <ReactMarkdown
        children={content}
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeRaw]}  
        components={{
          table: ({ node, ...props }) => (
            <table className="min-w-full divide-y divide-gray-700" {...props} />
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-gray-800" {...props} />
          ),
          tbody: ({ node, ...props }) => (
            <tbody className="bg-gray-900 divide-y divide-gray-700" {...props} />
          ),
          tr: ({ node, ...props }) => (
            <tr className="bg-gray-900" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300" {...props} />
          ),
          img: ({ node, src, alt, ...props }) => {
            try {
              const url = new URL(src ?? '');
              if (allowedImageDomains.includes(url.hostname)) {
                return (
                  <img
                    src={src}
                    alt={alt || 'Image'}
                    className="max-w-full h-auto rounded-lg shadow-md"
                    loading="lazy"
                    {...props}
                  />
                );
              }
            } catch {
              return null; 
            }
            return null; 
          },
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside pl-4" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-inside pl-4" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="mb-1 text-gray-300" {...props} />
          ),
          code: ({ inline, className, children, ...props }: CodeBlockProps) => {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter
                children={String(children).replace(/\n$/, '')}
                style={oneDark}
                language={match[1]}
                PreTag="div"
                className="rounded-lg overflow-x-auto text-sm"
              />
            ) : (
              <code 
                className={`${className} bg-gray-800 text-gray-200 px-1 py-0.5 rounded text-sm`} 
                {...props}
              >
                {children}
              </code>
            );
          },
        }}
      />
    </div>
  );
};

export default MarkdownRenderer;