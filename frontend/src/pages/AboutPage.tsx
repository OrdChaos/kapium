import Layout from '@/components/Layout';
import Banner from '@/components/Banner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wrench, MapPin, Briefcase, GraduationCap, Link as LinkIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';

import githubIcon from '@iconify-icons/ri/github-line';
import bilibiliIcon from '@iconify-icons/ri/bilibili-line';
import steamIcon from '@iconify-icons/ri/steam-line';
import mailIcon from '@iconify-icons/ri/mail-line';
import stackoverflowIcon from '@iconify-icons/simple-icons/stackoverflow';

interface SocialLink {
  platform: string;
  url: string;
  icon?: any;
}

interface EducationItem {
  degree: string;
  school: string;
  period: string;
}

interface ExperienceItem {
  position: string;
  company: string;
  period: string;
  description: string;
}

interface ProfileData {
  name: string;
  avatar: string;
  title?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  education?: EducationItem[];
  experience?: ExperienceItem[];
  socialLinks?: SocialLink[];
}

interface AboutPageProps {
  onSearchClick: () => void;
}

const SOCIAL_ICON_MAP: Record<string, any> = {
  GitHub: githubIcon,
  Bilibili: bilibiliIcon,
  Steam: steamIcon,
  Email: mailIcon,
  'Stack Overflow': stackoverflowIcon,
};

export default function AboutPage({ onSearchClick }: AboutPageProps) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    document.title = '关于 - ' + import.meta.env.VITE_SITE_TITLE;

    fetch('/data/profile.json')
      .then(res => res.json())
      .then(data => {
        setProfile({
          ...data,
          socialLinks: [
            {
              platform: 'GitHub',
              url: 'https://github.com/ordchaos',
            },
            {
              platform: 'Bilibili',
              url: 'https://space.bilibili.com/403648634',
            },
            {
              platform: 'Stack Overflow',
              url: 'https://stackoverflow.com/users/17990099/orderchaos',
            },
            {
              platform: 'Steam',
              url: 'https://steamcommunity.com/id/OrdChaos',
            },
            {
              platform: 'Email',
              url: 'mailto:orderchaos@ordchaos.com',
            },
          ],
        });
      });
  }, []);

  useEffect(() => {
    if (!visible && profile) {
      requestAnimationFrame(() => setVisible(true));
    }
  }, [profile, visible]);

  const getSocialIcon = (platform: string) => {
    const icon = SOCIAL_ICON_MAP[platform];
    if (!icon) return <LinkIcon className="h-5 w-5" />;
    return <Icon icon={icon} className="h-5 w-5" />;
  };

  return (
    <Layout onSearchClick={onSearchClick}>
      <Banner title="关于" subtitle="了解更多" height="standard" />

      <div className={`transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
        {profile && (
          <div className="container mx-auto px-4 py-12">
            <div className="mx-auto max-w-4xl">
              
              <Card className="mb-8 duration-300 hover:shadow-lg hover:border-primary/50">
                <CardHeader>
                  <div className="flex flex-col items-center gap-6 md:flex-row">
                    <img
                      src={profile.avatar}
                      alt={profile.name}
                      className="h-24 w-24 md:h-32 md:w-32 rounded-full object-cover shrink-0 border-4 border-border"
                    />
                    <div className="flex-1 text-center md:text-left">
                      <CardTitle className="mb-2 text-3xl">
                        {profile.name}
                      </CardTitle>

                      {profile.title && (
                        <div className="flex items-center justify-center gap-2 text-muted-foreground md:justify-start">
                          <Briefcase className="h-4 w-4" />
                          <span>{profile.title}</span>
                        </div>
                      )}

                      {profile.location && (
                        <div className="mt-2 flex items-center justify-center gap-2 text-muted-foreground md:justify-start">
                          <MapPin className="h-4 w-4" />
                          <span>{profile.location}</span>
                        </div>
                      )}

                      <div className="mt-4 flex flex-wrap justify-center gap-2 md:justify-start">
                        {profile.socialLinks?.map((social, index) => (
                          <a
                            key={index}
                            href={social.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={social.platform}
                            className="flex h-9 w-9 items-center justify-center rounded-md border border-border/70 bg-background text-foreground transition-all shadow hover:shadow-lg hover:border-primary/50 active:scale-95"
                          >
                            {getSocialIcon(social.platform)}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                {profile.bio && (
                  <CardContent>
                    <p className="text-center leading-relaxed text-muted-foreground md:text-left">
                      {profile.bio}
                    </p>
                  </CardContent>
                )}
              </Card>

              {profile.skills?.length ? (
                <Card className="mb-8 duration-300 hover:shadow-lg hover:border-primary/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wrench className="h-5 w-5" />
                      技能
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="px-3 py-1">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : null}

              {profile.education && profile.education.length > 0 && (
                <Card className="duration-300 hover:shadow-lg hover:border-primary/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      教育背景
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {profile.education.map((edu, index) => (
                        <div key={index} className="border-l-2 border-primary pl-4">
                          <h3 className="font-semibold">{edu.degree}</h3>
                          <p className="text-sm text-muted-foreground">
                            {edu.school} · {edu.period}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {profile.experience && profile.experience.length > 0 && (
                <Card className="mb-8 duration-300 hover:shadow-lg hover:border-primary/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      工作经历
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {profile.experience.map((exp, index) => (
                        <div key={index} className="border-l-2 border-primary pl-4">
                          <h3 className="font-semibold">{exp.position}</h3>
                          <p className="text-sm text-muted-foreground">
                            {exp.company} · {exp.period}
                          </p>
                          <p className="mt-2 text-sm">{exp.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
