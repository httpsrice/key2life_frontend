import React, { useMemo } from 'react';
import { renderMermaidASCII } from 'beautiful-mermaid';

interface MermaidBlockProps {
  content: string;
}

/**
 * MermaidBlock detects ```mermaid code blocks in the content string
 * and renders them as ASCII art using beautiful-mermaid.
 */
export const MermaidBlock: React.FC<MermaidBlockProps> = ({ content }) => {
  const segments = useMemo(() => {
    // Regex to capture blocks between ```mermaid and ```
    const regex = /```mermaid\n([\s\S]*?)```/g;
    const parts: { type: 'text' | 'mermaid'; content: string }[] = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(content)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: content.slice(lastIndex, match.index),
        });
      }
      // Add the mermaid content
      parts.push({
        type: 'mermaid',
        content: match[1].trim(),
      });
      lastIndex = regex.lastIndex;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        content: content.slice(lastIndex),
      });
    }

    return parts;
  }, [content]);

  return (
    <>
      {segments.map((segment, index) => {
        if (segment.type === 'mermaid') {
          return <MermaidRenderer key={index} code={segment.content} />;
        }
        return <span key={index} className="whitespace-pre-wrap">{segment.content}</span>;
      })}
    </>
  );
};

const MermaidRenderer: React.FC<{ code: string }> = ({ code }) => {
  const rendered = useMemo(() => {
    try {
      return renderMermaidASCII(code, { theme: 'zincDark' });
    } catch (error) {
      console.error('Mermaid rendering failed:', error);
      return null;
    }
  }, [code]);

  if (!rendered) {
    return (
      <pre className="font-mono text-[10px] text-[#00FF41] bg-black/20 border border-[#003A14] p-2 my-2 overflow-x-auto">
        {code}
      </pre>
    );
  }

  return (
    <pre 
      style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: '10px',
        color: '#00FF41',
        background: 'rgba(0, 255, 65, 0.03)',
        border: '1px solid #003A14',
        borderLeft: '2px solid #00FF41',
        padding: '8px 12px',
        overflowX: 'auto',
        lineHeight: '1.3',
        margin: '8px 0',
      }}
    >
      {rendered}
    </pre>
  );
};
