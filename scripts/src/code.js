const fs = require('fs');
const path = require('path');
const { createHighlighter } = require('shiki');

async function processCodeBlocks() {
  const postsDir = process.argv[2];
  
  if (!fs.existsSync(postsDir)) {
    console.error(`[ERROR] 目录不存在: ${postsDir}`);
    return;
  }

  // 1. 初始化 Shiki
  const highlighter = await createHighlighter({
    themes: ['github-light', 'github-dark'],
    langs: ['javascript', 'python', 'html', 'css', 'bash', 'json', 'cpp', 'c', 'rust', 'yaml', 'typescript', 'shell']
  });

  const postFiles = fs.readdirSync(postsDir).filter(f => f.endsWith('.json'));

  for (const file of postFiles) {
    const filePath = path.join(postsDir, file);
    const post = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // 2. 使用 replace 的回调函数模式，避免重复内容被错误替换
    const codeBlockRegex = /<pre><code class="language-(\w+)">([\s\S]*?)<\/code><\/pre>/g;

    post.content = post.content.replace(codeBlockRegex, (fullMatch, lang, code) => {
      // 3. 反转义 HTML 实体，还原原始代码供 Shiki 处理
      const rawCode = code
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'")
        .replace(/&#39;/g, "'");

      try {
        const highlightedHtml = highlighter.codeToHtml(rawCode, {
          lang,
          themes: {
            light: 'github-light',
            dark: 'github-dark'
          },
          transformers: [{
            line(node, line) {
              node.properties['data-line'] = line;
              // 确保每一行都有 .line 类名，方便 CSS 和 JS 识别
              if (!node.properties.className) node.properties.className = [];
              node.properties.className.push('line');
            }
          }]
        });

        // 4. 包装自定义外壳
        return `<div class="code-block-wrapper">
          <div class="code-block-header">
            <span class="code-lang">${lang.toUpperCase()}</span>
            <div class="copy-card" onclick="window.copyToClipboard(this)">Copy</div>
          </div>
          ${highlightedHtml}
        </div>`.trim();
      } catch (error) {
        console.warn(`[WARN] 文件 ${file} 中的代码块处理失败:`, error.message);
        return fullMatch; // 失败则保留原样
      }
    });

    fs.writeFileSync(filePath, JSON.stringify(post, null, 2));
  }

  console.log(`[SUCCESS] 已处理 ${postFiles.length} 个文件。`);
  highlighter.dispose();
}

processCodeBlocks();