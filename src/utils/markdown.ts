import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm';

export const convertMarkdownToHtml = async (markdown: string): Promise<string> => {
  try {
    const result = await remark()
      .use(remarkGfm)
      .use(html)
      .process(markdown);
    return result.toString();
  } catch (error) {
    console.error('Error converting markdown to HTML:', error);
    return markdown; // Fallback to raw markdown if conversion fails
  }
};

export const sanitizeMarkdown = (markdown: string): string => {
  // Basic sanitization to remove potentially dangerous content
  // In a production app, you'd want a more comprehensive solution
  return markdown
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+="[^"]*"/g, '');
};