import { Icon, addCollection } from '@iconify/react';
import ccIcons from '@/icons/cc.json';

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';

addCollection(ccIcons);

type License =
  | 'BY'
  | 'BY-SA'
  | 'BY-ND'
  | 'BY-NC'
  | 'BY-NC-SA'
  | 'BY-NC-ND'
  | 'ZERO'
  | string;

interface LicenseBoxProps {
  title: string;
  permalink: string;
  author?: string;
  postedAt?: string;
  updatedAt?: string;
  license?: License;
}

const LICENSE_ICON_MAP: Record<string, string> = {
  BY: 'cc:by',
  SA: 'cc:sa',
  ND: 'cc:nd',
  NC: 'cc:nc',
  ZERO: 'cc:zero',
};

const LICENSE_LABEL_MAP: Record<string, string> = {
  BY: 'BY - 署名',
  NC: 'NC - 非商业性使用',
  SA: 'SA - 相同方式共享',
  ND: 'ND - 禁止演绎',
  ZERO: 'CC0 - 公共领域',
};

export default function LicenseBox({
  title,
  permalink,
  author,
  postedAt,
  updatedAt,
  license,
}: LicenseBoxProps) {
  const licenseItems =
    license && license.includes('-') ? license.split('-') : [];

  const licenseUrl =
    license === 'ZERO'
      ? 'https://creativecommons.org/publicdomain/zero/1.0/'
      : license
      ? `https://creativecommons.org/licenses/${license.toLowerCase()}/4.0/`
      : '';

  return (
    <div
      className="
        relative my-6 px-6 py-5 text-sm text-foreground
        rounded-lg border border-border bg-card
        shadow-md transition
        hover:shadow-lg hover:border-primary/50
        overflow-hidden
      "
    >
      <div className="mb-4">
        <div className="text-[15px] font-semibold">
          {title}
        </div>

        <div className="text-[13px] text-muted-foreground break-all">
          <a
            href={permalink}
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-primary"
          >
            {permalink}
          </a>
        </div>
      </div>

      <div className="grid grid-flow-col auto-cols-max gap-x-4 gap-y-3">
        {author && (
          <div className="flex flex-col gap-px">
            <div className="text-xs text-muted-foreground">作者</div>
            <div>{author}</div>
          </div>
        )}

        {postedAt && (
          <div className="flex flex-col gap-px">
            <div className="text-xs text-muted-foreground">发布于</div>
            <div>{postedAt}</div>
          </div>
        )}

        {updatedAt && (
          <div className="flex flex-col gap-px">
            <div className="text-xs text-muted-foreground">更新于</div>
            <div>{updatedAt}</div>
          </div>
        )}

        {license && (
          <div className="flex flex-col gap-px">
            <div className="text-xs text-muted-foreground">许可协议</div>

            <div className="flex items-center gap-[2px]">
              {license === 'ZERO' ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href={licenseUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="CC0"
                      className="opacity-80 transition hover:opacity-100 hover:text-primary"
                    >
                      <Icon
                        icon={LICENSE_ICON_MAP.ZERO}
                        className="h-5 w-5"
                      />
                    </a>
                  </TooltipTrigger>

                  <TooltipContent side="top" sideOffset={6}>
                    {LICENSE_LABEL_MAP.ZERO}
                  </TooltipContent>
                </Tooltip>
              ) : (
                licenseItems.map((item) => (
                  <Tooltip key={item}>
                    <TooltipTrigger asChild>
                      <a
                        href={licenseUrl}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={item}
                        className="opacity-80 transition hover:opacity-100 hover:text-primary"
                      >
                        <Icon
                          icon={LICENSE_ICON_MAP[item]}
                          className="h-5 w-5"
                        />
                      </a>
                    </TooltipTrigger>

                    <TooltipContent side="top" sideOffset={6}>
                      {LICENSE_LABEL_MAP[item]}
                    </TooltipContent>
                  </Tooltip>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <div
        className="
          pointer-events-none absolute
          -right-[18px] -bottom-[22px]
          text-muted-foreground opacity-20
        "
      >
        <Icon icon="cc:cc" className="h-[120px] w-[120px]" />
      </div>
    </div>
  );
}
