const fs = require('fs');
const path = require('path');
const pangu = require('pangu');

function autoSpacingContent(html) {
  if (typeof html !== 'string' || !html.trim()) return html;

  // 保护代码块
  const protectedBlocks = [];
  let blockIndex = 0;

  let content = html.replace(
    /(<(pre|code|script|style|textarea|x-equation)\b[^>]*>[\s\S]*?<\/\2>)/gi,
    (match) => {
      const placeholder = `__PROTECT_${blockIndex}__`;
      protectedBlocks.push(match);
      blockIndex++;
      return placeholder;
    }
  );

  content = pangu.spacingText(content);

  // 恢复代码块
  content = content.replace(/__PROTECT_(\d+)__/g, (_, idx) => protectedBlocks[Number(idx)] || '');

  return content;
}

// 主逻辑（同你原来的代码块处理脚本风格）
async function processPosts() {
  const postsDir = process.argv[2];

  if (!postsDir || !fs.existsSync(postsDir)) {
    console.error(`[ERROR] 请提供 posts 目录： node auto-spacing-dom.js ./posts`);
    process.exit(1);
  }

  const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.json'));
  if (files.length === 0) {
    console.log('[INFO] 无 .json 文件');
    return;
  }

  let count = 0;
  for (const file of files) {
    const filePath = path.join(postsDir, file);
    let post;
    try {
      post = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch {
      console.warn(`[WARN] ${file} 无效 JSON`);
      continue;
    }

    if (!post.content || typeof post.content !== 'string') continue;

    const before = post.content;
    post.content = autoSpacingContent(post.content);

    if (post.content !== before) {
      fs.writeFileSync(filePath, JSON.stringify(post, null, 2), 'utf8');
      console.log(`[OK] ${file} 已更新`);
      count++;
    } else {
      console.log(`[SKIP] ${file} 无需变更`);
    }
  }

  console.log(`\n[SUCCESS] 更新了 ${count} 个文件`);
}

processPosts().catch(err => {
  console.error('[ERROR]', err);
  process.exit(1);
});