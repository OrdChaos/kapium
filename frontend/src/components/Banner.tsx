interface BannerProps {
  title: string;
  subtitle?: string;
  height?: 'standard' | 'tall';
}

export default function Banner({
  title,
  subtitle,
  height = 'standard',
}: BannerProps) {
  const heightClass = height === 'tall' ? 'h-[400px] md:h-[500px]' : 'h-[200px] md:h-[280px]';

  return (
    <div
      className={`relative flex items-center justify-center ${heightClass} w-full bg-muted/50`}
    >
      <div className="container mx-auto px-4 text-center">
        <h1
          className={`font-bold tracking-tight text-foreground ${
            height === 'tall' ? 'text-4xl md:text-6xl' : 'text-3xl md:text-5xl'
          }`}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="mt-4 text-lg md:text-xl text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}