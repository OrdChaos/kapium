const katex = require('katex');
const fs = require('fs');
const path = require('path');

function processLatexPrerender() {
  const postsDir = process.argv[2];
  
  if (!fs.existsSync(postsDir)) {
    console.error(`[SCRIPT.MATH] 目录不存在: ${postsDir}`);
    return;
  }

  const postFiles = fs.readdirSync(postsDir);
  let processedCount = 0;

  postFiles.forEach(file => {
    if (path.extname(file) !== '.json') return;

    const filePath = path.join(postsDir, file);
    const post = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    if (post.math !== true) return;
    
    post.content = post.content.replace(
      /<x-equation(?:\s+type="([^"]+)")?>([\s\S]*?)<\/x-equation>/g,
      (match, type, formula) => {
        const decodedFormula = formula
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&#x27;/g, "'")
          .trim();

        const isDisplayMode = type === 'display';

        try {
          const rendered = katex.renderToString(decodedFormula, {
            displayMode: isDisplayMode,
            throwOnError: false,
            output: 'html'
          });
          
          return `<x-equation class="rendered-equation" data-type="${type || 'inline'}">${rendered}</x-equation>`;
        } catch (error) {
          console.warn(`[SCRIPT.MATH] 无法解析语法： ${decodedFormula.substring(0, 20)}...`);
          return match;
        }
      }
    );
    
    fs.writeFileSync(filePath, JSON.stringify(post, null, 2));
    processedCount++;
  });

  console.log(`[SCRIPT.MATH] 成功进行了 ${processedCount} 篇文章的LaTeX预渲染`);
}

processLatexPrerender();