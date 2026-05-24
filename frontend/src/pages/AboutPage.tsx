import Layout from '@/components/Layout';
import Banner from '@/components/Banner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wrench, MapPin, Briefcase, GraduationCap, Link as LinkIcon, Heart, Target, Zap, Gamepad2, Sparkles, FolderGit2, BarChart3, FileText, FolderOpen, Tag, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { useSEO } from '@/hooks/use-seo';
import { usePageLoading } from '@/hooks/use-page-loading';
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

interface MbtiTrait {
  name: string;
  value: number;
}

interface ProjectItem {
  name: string;
  desc: string;
  url: string;
  tech: string[];
}

interface StatsData {
  postCount: number;
  categoryCount: number;
  tagCount: number;
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
  titleFull?: string;
  mbti?: string;
  mbtiTitle?: string;
  mbtiRole?: string;
  mbtiStrategy?: string;
  mbtiTraits?: MbtiTrait[];
  alignment?: string;
  games?: string[];
  interests?: string[];
  pursuits?: string[];
  projects?: ProjectItem[];
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
  const [stats, setStats] = useState<StatsData | null>(null);
  const [visible, setVisible] = useState(false);

  // Complete loading bar when profile is loaded
  usePageLoading(profile !== null);

  // SEO Management
  const seoElement = useSEO({
    title: '关于',
    description: '了解更多',
  });

  useEffect(() => {
    fetch('/data/profile.json')
      .then(res => res.json())
      .then(data => {
        setProfile(data);
      });

    fetch('/data/stats.json')
      .then(res => res.json())
      .then(data => {
        setStats(data);
      })
      .catch(() => {}); // stats.json may not exist yet
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
      {seoElement}
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

                      {profile.titleFull && (
                        <div className="mt-2 flex items-center justify-center gap-2 text-primary font-medium md:justify-start">
                          <Sparkles className="h-4 w-4" />
                          <span>{profile.titleFull}</span>
                        </div>
                      )}

                      {profile.title && (
                        <div className="mt-2 flex items-center justify-center gap-2 text-muted-foreground md:justify-start">
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

              {/* 统计面板 */}
              {stats && (
                <Card className="mb-8 duration-300 hover:shadow-lg hover:border-primary/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      站点统计
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center justify-around pb-6">
                    <Link href="/timeline" className="flex flex-col items-center gap-1 rounded-md px-4 py-2 transition-colors hover:bg-muted/50">
                      <FileText className="h-6 w-6 text-primary" />
                      <div className="text-2xl font-bold">{stats.postCount}</div>
                      <div className="text-xs text-muted-foreground">文章</div>
                    </Link>
                    <div className="h-10 w-px bg-border" />
                    <Link href="/categories" className="flex flex-col items-center gap-1 rounded-md px-4 py-2 transition-colors hover:bg-muted/50">
                      <FolderOpen className="h-6 w-6 text-primary" />
                      <div className="text-2xl font-bold">{stats.categoryCount}</div>
                      <div className="text-xs text-muted-foreground">分类</div>
                    </Link>
                    <div className="h-10 w-px bg-border" />
                    <Link href="/tags" className="flex flex-col items-center gap-1 rounded-md px-4 py-2 transition-colors hover:bg-muted/50">
                      <Tag className="h-6 w-6 text-primary" />
                      <div className="text-2xl font-bold">{stats.tagCount}</div>
                      <div className="text-xs text-muted-foreground">标签</div>
                    </Link>
                  </CardContent>
                </Card>
              )}

              {/* MBTI 人格卡片 */}
              {profile.mbti && (
                <Card className="mb-8 duration-300 hover:shadow-lg hover:border-primary/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      MBTI 人格
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge variant="secondary" className="text-lg px-5 py-2">
                        {profile.mbti}
                        {profile.mbtiTitle && (
                          <span className="ml-2 text-sm text-muted-foreground">({profile.mbtiTitle})</span>
                        )}
                      </Badge>
                      {profile.mbtiRole && (
                        <Badge variant="outline" className="text-sm px-4 py-1.5">
                          角色：{profile.mbtiRole}
                        </Badge>
                      )}
                      {profile.mbtiStrategy && (
                        <Badge variant="outline" className="text-sm px-4 py-1.5">
                          策略：{profile.mbtiStrategy}
                        </Badge>
                      )}
                    </div>

                    {profile.mbtiTraits && profile.mbtiTraits.length > 0 && (
                      <div className="space-y-3">
                        <div className="text-sm font-medium text-muted-foreground">人格特征</div>
                        {profile.mbtiTraits.map((trait, index) => (
                          <div key={index} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>{trait.name}</span>
                              <span className="text-muted-foreground">{trait.value}%</span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                              <div 
                                className="h-full bg-primary transition-all duration-500"
                                style={{ width: `${trait.value}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* 身份认同 & 兴趣爱好 双栏 */}
              {(profile.alignment || (profile.pursuits && profile.pursuits.length > 0) || (profile.games && profile.games.length > 0) || (profile.interests && profile.interests.length > 0)) && (
                <div className="grid gap-8 mb-8 md:grid-cols-2">
                  {/* 身份认同 */}
                  {(profile.alignment || (profile.pursuits && profile.pursuits.length > 0)) && (
                    <Card className="duration-300 hover:shadow-lg hover:border-primary/50">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Heart className="h-5 w-5" />
                          身份认同
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {profile.alignment && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                              <Target className="h-4 w-4" />
                              阵营
                            </div>
                            <Badge variant="secondary" className="text-base px-4 py-2">
                              {profile.alignment}
                            </Badge>
                          </div>
                        )}

                        {profile.pursuits && profile.pursuits.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                              <Heart className="h-4 w-4" />
                              追求
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {profile.pursuits.map((pursuit, index) => (
                                <Badge key={index} variant="secondary" className="px-3 py-1.5">
                                  {pursuit}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* 兴趣爱好 */}
                  {((profile.games && profile.games.length > 0) || (profile.interests && profile.interests.length > 0)) && (
                    <Card className="duration-300 hover:shadow-lg hover:border-primary/50">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Gamepad2 className="h-5 w-5" />
                          兴趣爱好
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {profile.games && profile.games.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                              <Gamepad2 className="h-4 w-4" />
                              爱好游戏
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {profile.games.map((game, index) => (
                                <Badge key={index} variant="secondary" className="px-3 py-1.5">
                                  {game}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {profile.interests && profile.interests.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                              <Sparkles className="h-4 w-4" />
                              关注偏好
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {profile.interests.map((interest, index) => (
                                <Badge key={index} variant="secondary" className="px-3 py-1.5">
                                  {interest}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* 个人项目 */}
              {profile.projects && profile.projects.length > 0 && (
                <Card className="mb-8 duration-300 hover:shadow-lg hover:border-primary/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FolderGit2 className="h-5 w-5" />
                      个人项目
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {profile.projects.map((project, index) => (
                        <a
                          key={index}
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex flex-col gap-2 rounded-lg border border-border/70 p-4 transition-all hover:border-primary/30 hover:bg-muted/30 group cursor-pointer"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <span className="inline-flex items-center gap-1.5 font-semibold text-foreground group-hover:text-primary transition-colors">
                                {project.name}
                                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                              </span>
                              {project.desc && (
                                <p className="mt-1 text-sm text-muted-foreground">{project.desc}</p>
                              )}
                            </div>
                          </div>
                          {project.tech && project.tech.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {project.tech.map((tech, ti) => (
                                <Badge key={ti} variant="outline" className="text-xs px-2 py-0 pointer-events-none">
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </a>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

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
                <Card className="mb-8 duration-300 hover:shadow-lg hover:border-primary/50">
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
