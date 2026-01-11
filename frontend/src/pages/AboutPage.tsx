import Layout from '@/components/Layout';
import Banner from '@/components/Banner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Github, Twitter, MapPin, Briefcase, GraduationCap } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AboutPageProps {
  onSearchClick: () => void;
}

export default function AboutPage({ onSearchClick }: AboutPageProps) {
  const [profile, setProfile] = useState<any | null>(null);
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
              <Card className="mb-8">
                <CardHeader>
                  <div className="flex flex-col items-center gap-6 md:flex-row">
                    <img
                      src={profile.avatar}
                      alt={profile.name}
                      className="h-32 w-32 rounded-full border-4 border-border"
                    />
                    <div className="flex-1 text-center md:text-left">
                      <CardTitle className="mb-2 text-3xl">{profile.name}</CardTitle>
                      <div className="mb-4 space-y-2 text-muted-foreground">
                        <div className="flex items-center justify-center gap-2 md:justify-start">
                          <Briefcase className="h-4 w-4" />
                          <span>{profile.title}</span>
                        </div>
                        <div className="flex items-center justify-center gap-2 md:justify-start">
                          <MapPin className="h-4 w-4" />
                          <span>{profile.location}</span>
                        </div>
                      </div>
                      <div className="flex justify-center gap-2 md:justify-start">
                        <Button variant="outline" size="icon" asChild>
                          <a
                            href="https://github.com"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Github className="h-5 w-5" />
                          </a>
                        </Button>
                        <Button variant="outline" size="icon" asChild>
                          <a
                            href="https://twitter.com"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Twitter className="h-5 w-5" />
                          </a>
                        </Button>
                        <Button variant="outline" size="icon" asChild>
                          <a href="mailto:your@email.com">
                            <Mail className="h-5 w-5" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-center leading-relaxed text-muted-foreground md:text-left">
                    {profile.bio}
                  </p>
                </CardContent>
              </Card>

              {/* 技能 */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>技能</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="px-3 py-1">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 工作经历 */}
              <Card className="mb-8">
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

              {/* 教育背景 */}
              <Card>
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
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}