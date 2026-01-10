"use client";

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'prism-react-renderer';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
  ageGroup?: 'young' | 'middle' | 'older';
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, ageGroup = 'middle' }) => {
  // Get age group specific styles
  const getAgeGroupStyles = () => {
    switch (ageGroup) {
      case 'young':
        return {
          fontSize: 'text-lg',
          lineHeight: 'leading-relaxed',
          paragraphSpacing: 'mb-6',
          headingSize: {
            h1: 'text-2xl',
            h2: 'text-xl',
            h3: 'text-lg'
          }
        };
      case 'middle':
        return {
          fontSize: 'text-base',
          lineHeight: 'leading-normal',
          paragraphSpacing: 'mb-4',
          headingSize: {
            h1: 'text-xl',
            h2: 'text-lg',
            h3: 'text-base'
          }
        };
      case 'older':
        return {
          fontSize: 'text-sm',
          lineHeight: 'leading-snug',
          paragraphSpacing: 'mb-3',
          headingSize: {
            h1: 'text-lg',
            h2: 'text-base',
            h3: 'text-sm'
          }
        };
    }
  };

  const styles = getAgeGroupStyles();

  return (
    <div className={cn(
      "prose dark:prose-invert max-w-none",
      styles.fontSize,
      styles.lineHeight
    )}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({node, ...props}) => (
            <h1
              className={cn(
                "font-bold mb-4 pb-2 border-b border-gray-200 dark:border-gray-700",
                styles.headingSize.h1
              )}
              {...props}
            />
          ),
          h2: ({node, ...props}) => (
            <h2
              className={cn(
                "font-semibold mt-6 mb-3 pb-1 border-b border-gray-100 dark:border-gray-800",
                styles.headingSize.h2
              )}
              {...props}
            />
          ),
          h3: ({node, ...props}) => (
            <h3
              className={cn(
                "font-medium mt-4 mb-2",
                styles.headingSize.h3
              )}
              {...props}
            />
          ),
          p: ({node, ...props}) => (
            <p className={cn("mb-4", styles.paragraphSpacing)} {...props} />
          ),
          code: ({node, className, children, ...props}) => {
            const match = /language-(\w+)/.exec(className || '');
            return match ? (
              <SyntaxHighlighter
                language={match[1]}
                Prism={typeof window !== 'undefined' ? require('prismjs') : null}
                theme={typeof window !== 'undefined' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? require('prism-react-renderer/themes/vsDark') : require('prism-react-renderer/themes/vsLight')) : null}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={cn(className, "bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded")} {...props}>
                {children}
              </code>
            );
          },
          ul: ({node, ...props}) => (
            <ul className="list-disc list-inside space-y-2 mb-4" {...props} />
          ),
          ol: ({node, ...props}) => (
            <ol className="list-decimal list-inside space-y-2 mb-4" {...props} />
          ),
          li: ({node, ...props}) => (
            <li className="ml-4" {...props} />
          ),
          blockquote: ({node, ...props}) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 dark:text-gray-400 mb-4" {...props} />
          ),
          img: ({node, ...props}) => (
            <div className="my-4 flex justify-center">
              <img
                className="max-w-full h-auto rounded-lg shadow-md"
                style={{ maxHeight: '400px' }}
                {...props}
              />
            </div>
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;