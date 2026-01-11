export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-2 text-center text-sm text-muted-foreground">
          <p>© {currentYear} 序炁的博客. All rights reserved.</p>
          <p>这里可以添加更多内容行</p>
          <p>例如：备案号、站点说明等信息</p>
        </div>
      </div>
    </footer>
  );
}