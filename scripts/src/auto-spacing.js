const fs = require('fs');
const path = require('path');
const pangu = require('pangu');

function autoSpacingContent(html) {
  if (typeof html !== 'string' || !html.trim()) return html;

  const protectedBlocks = [];
  let blockIndex = 0;

  let content = html;

  content = content.replace(
    /(<(pre|code|script|style|textarea|x-equation)\b[^>]*>[\s\S]*?<\/\2>)/gi,
    (match) => {
      const placeholder = `__BLOCK_${blockIndex}__`;
      protectedBlocks.push(match);
      blockIndex++;
      return placeholder;
    }
  );

  content = content.replace(
    /(&[a-zA-Z0-9#]+;)/g,
    (match) => {
      const placeholder = `__ENTITY_${blockIndex}__`;
      protectedBlocks.push(match);
      blockIndex++;
      return placeholder;
    }
  );

  content = content.replace(
    /(<[a-z][a-z0-9-]*\b[^>]*>)/gi,
    (match) => {
      const placeholder = `__TAG_START_${blockIndex}__`;
      protectedBlocks.push(match);
      blockIndex++;
      return placeholder;
    }
  );

  content = content.replace(
    /(<\/[a-z][a-z0-9-]*>)/gi,
    (match) => {
      const placeholder = `__TAG_END_${blockIndex}__`;
      protectedBlocks.push(match);
      blockIndex++;
      return placeholder;
    }
  );

  content = pangu.spacingText(content);

  content = content.replace(/__TAG_END_(\d+)__/g, (_, idx) => protectedBlocks[Number(idx)] || '');
  content = content.replace(/__TAG_START_(\d+)__/g, (_, idx) => protectedBlocks[Number(idx)] || '');
  content = content.replace(/__ENTITY_(\d+)__/g, (_, idx) => protectedBlocks[Number(idx)] || '');
  content = content.replace(/__BLOCK_(\d+)__/g, (_, idx) => protectedBlocks[Number(idx)] || '');

  return content;
}

async function processPosts() {
  const postsDir = process.argv[2];

  if (!postsDir || !fs.existsSync(postsDir)) {
    console.error(`[SCRIPT.SPACE] 请提供 posts 目录： node auto-spacing-dom.js ./posts`);
    process.exit(1);
  }

  const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.json'));
  if (files.length === 0) {
    console.log('[SCRIPT.SPACE] 无 .json 文件');
    return;
  }

  let count = 0;
  for (const file of files) {
    const filePath = path.join(postsDir, file);
    let post;
    try {
      post = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch {
      console.warn(`[SCRIPT.SPACE] ${file} 无效 JSON`);
      continue;
    }

    if (!post.content || typeof post.content !== 'string') continue;

    const before = post.content;
    post.content = autoSpacingContent(post.content);

    if (post.content !== before) {
      fs.writeFileSync(filePath, JSON.stringify(post, null, 2), 'utf8');
      console.log(`[SCRIPT.SPACE] ${file} 已更新`);
      count++;
    } else {
      console.log(`[SCRIPT.SPACE] ${file} 无需变更`);
    }
  }

  console.log(`\n[SCRIPT.SPACE] 更新了 ${count} 个文件`);
}

processPosts().catch(err => {
  console.error('[SCRIPT.SPACE]', err);
  process.exit(1);
});