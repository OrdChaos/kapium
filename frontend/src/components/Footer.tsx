import { useState, useEffect } from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [uptime, setUptime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const startDate = new Date('2022-01-01T00:00:00').getTime();
    
    const calculateUptime = () => {
      const now = new Date().getTime();
      const diff = now - startDate;
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setUptime({ days, hours, minutes, seconds });
    };
    
    calculateUptime();
    const interval = setInterval(calculateUptime, 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="border-t border-border/90 bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-2 text-center text-sm text-muted-foreground">
          <p>© {currentYear} 谐元场域 - 保留一切权利</p>
          <p>由 <a href="https://github.com/ordchaos/kapium" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-primary duration-300">Kapium</a> 构建</p>
          <p>本站已稳定运行 {uptime.days} 天 {uptime.hours} 时 {uptime.minutes} 分 {uptime.seconds} 秒</p>
          <p><a href="https://icp.gov.moe/?keyword=20220824" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-primary duration-300">萌 ICP 备 20220824 号</a></p>
        </div>
      </div>
    </footer>
  );
}