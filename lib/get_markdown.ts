import fs from 'fs';
import path from 'path';

export function getMarkdown(fileName: string) {
  const fullPath = path.join(process.cwd(), 'content', `${fileName}.md`);
  const content = fs.readFileSync(fullPath, 'utf8');
  return content;
}
