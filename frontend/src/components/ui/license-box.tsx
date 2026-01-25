import { Icon,addCollection } from '@iconify/react';
import ccIcons from '@/icons/cc.json';

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
    <div className="license-box rounded-lg border border-border shadow-md overflow-hidden bg-card duration-300 hover:shadow-lg hover:border-primary/50">
      {/* title */}
      <div className="license-title">
        <div className="license-title-name">{title}</div>
        <div className="license-title-link"><a href={permalink} target="_blank" rel="noreferrer">{permalink}</a></div>
      </div>

      {/* meta */}
      <div className="license-meta">
        {author && (
          <div className="license-meta-item">
            <div className="license-label">作者</div>
            <div className="license-value">{author}</div>
          </div>
        )}

        {postedAt && (
          <div className="license-meta-item">
            <div className="license-label">发布于</div>
            <div className="license-value">{postedAt}</div>
          </div>
        )}

        {updatedAt && (
          <div className="license-meta-item">
            <div className="license-label">更新于</div>
            <div className="license-value">{updatedAt}</div>
          </div>
        )}

        {license && (
          <div className="license-meta-item">
            <div className="license-label">许可协议</div>
            <div className="license-value">
              <div className="license-icons">
                {license === 'ZERO' ? (
                  <a href={licenseUrl} target="_blank" rel="noreferrer">
                    <Icon icon={LICENSE_ICON_MAP.ZERO} />
                  </a>
                ) : (
                  licenseItems.map((item) => (
                    <a
                      key={item}
                      href={licenseUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={item}
                    >
                      <Icon icon={LICENSE_ICON_MAP[item]} />
                    </a>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* watermark */}
      <div className="license-bg-icon">
        <Icon icon="cc:cc" />
      </div>
    </div>
  );
}
