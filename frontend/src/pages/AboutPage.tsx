import Layout from '@/components/Layout';
import Banner from '@/components/Banner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wrench, MapPin, Briefcase, GraduationCap, Link as LinkIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';

interface SocialLink {
  platform: string;
  url: string;
  icon?: string; // 可选的自定义图标类型
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
  title?: string; // 可选字段
  location?: string; // 可选字段
  bio?: string; // 可选字段
  skills?: string[]; // 可选字段
  education?: EducationItem[]; // 可选字段
  experience?: ExperienceItem[]; // 可选字段
  socialLinks?: SocialLink[]; // 新增：可选的社交媒体链接数组
}

interface AboutPageProps {
  onSearchClick: () => void;
}

export default function AboutPage({ onSearchClick }: AboutPageProps) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // 设置页面标题
    document.title = '关于 - 序炁的博客';
    
    fetch('/data/profile.json')
      .then(res => res.json())
      .then(data => setProfile(data));
  }, []);

  useEffect(() => {
    if (!visible && profile) {
      requestAnimationFrame(() => setVisible(true));
    }
  }, [profile, visible]);


  const getSocialIcon = (iconName?: string) => {
    if (!iconName) return <LinkIcon className="h-5 w-5" />;
    return <Icon icon={iconName} className="h-5 w-5" />;
  };

  return (
    <Layout onSearchClick={onSearchClick}>
      <Banner
        title="关于我"
        subtitle="了解更多"
        height="standard"
      />
      <div className={`transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
        {profile && (
          <div className="container mx-auto px-4 py-12">
            <div className="mx-auto max-w-4xl">
              {/* 个人信息卡片 */}
              <Card className="mb-8 duration-300 hover:shadow-lg hover:border-primary/50">
                <CardHeader>
                  <div className="flex flex-col items-center gap-6 md:flex-row">
                    <img
                      src={profile.avatar}
                      alt={profile.name}
                      className="
                        h-24 w-24 md:h-32 md:w-32
                        rounded-full
                        object-cover
                        shrink-0
                        border-4 border-border
                        avatar
                      "
                    />
                    <div className="flex-1 text-center md:text-left">
                      <CardTitle className="mb-2 text-3xl">{profile.name}</CardTitle>
                      {profile.title && (
                        <div className="mb-4 space-y-2 text-muted-foreground">
                          <div className="flex items-center justify-center gap-2 md:justify-start">
                            <Briefcase className="h-4 w-4" />
                            <span>{profile.title}</span>
                          </div>
                        </div>
                      )}
                      {profile.location && (
                        <div className="mb-4 space-y-2 text-muted-foreground">
                          <div className="flex items-center justify-center gap-2 md:justify-start">
                            <MapPin className="h-4 w-4" />
                            <span>{profile.location}</span>
                          </div>
                        </div>
                      )}
                      <div className="flex flex-wrap justify-center gap-2 md:justify-start">
                        {profile.socialLinks && profile.socialLinks.length > 0 && (
                          profile.socialLinks.map((social, index) => (
                            <Button 
                              key={index} 
                              variant="outline" 
                              size="icon" 
                              asChild
                            >
                              <a
                                href={social.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={social.platform}
                              >
                                {/* 调用新的渲染函数 */}
                                {getSocialIcon(social.icon)}
                              </a>
                            </Button>
                          ))
                        )}
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

              {/* 技能 - 仅在存在时显示 */}
              {profile.skills && profile.skills.length > 0 && (
                <Card className="mb-8 duration-300 hover:shadow-lg hover:border-primary/50">
                  <CardHeader>
                    <CardTitle  className="flex items-center gap-2">
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
              )}

              {/* 教育背景 - 仅在存在时显示 */}
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

              {/* 工作经历 - 仅在存在时显示 */}
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