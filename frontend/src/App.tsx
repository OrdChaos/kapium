import { Route, Switch } from 'wouter';
import { useState, useCallback } from 'react';
import { Toaster } from '@/components/ui/sonner';
import SearchDialog from '@/components/SearchDialog';
import ScrollToTop from '@/components/ScrollToTop';
import HomePage from '@/pages/HomePage';
import CategoriesPage from '@/pages/CategoriesPage';
import TagsPage from '@/pages/TagsPage';
import LinksPage from '@/pages/LinksPage';
import AboutPage from '@/pages/AboutPage';
import PostPage from '@/pages/PostPage';
import TemplatePage from '@/pages/TemplatePage';
import TimelinePage from '@/pages/TimelinePage';
import NotFoundPage from '@/pages/NotFoundPage';

export default function App() {
  const [searchOpen, setSearchOpen] = useState(false);

  // 稳定的打开搜索函数
  const openSearch = useCallback(() => setSearchOpen(true), [setSearchOpen]);

  // 为每条路由创建 memoized wrapper，防止因 App 重新渲染导致路由组件引用变化从而重挂载页面
  const HomeRoute = useCallback(() => <HomePage onSearchClick={openSearch} />, [openSearch]);
  const CategoriesRoute = useCallback(() => <CategoriesPage onSearchClick={openSearch} />, [openSearch]);
  const TagsRoute = useCallback(() => <TagsPage onSearchClick={openSearch} />, [openSearch]);
  const LinksRoute = useCallback(() => <LinksPage onSearchClick={openSearch} />, [openSearch]);
  const AboutRoute = useCallback(() => <AboutPage onSearchClick={openSearch} />, [openSearch]);
  const PostRoute = useCallback(() => <PostPage onSearchClick={openSearch} />, [openSearch]);
  const TemplateRoute = useCallback(() => <TemplatePage onSearchClick={openSearch} />, [openSearch]);
  const TimelineRoute = useCallback(() => <TimelinePage onSearchClick={openSearch} />, [openSearch]);
  const NotFoundRoute = useCallback(() => <NotFoundPage onSearchClick={openSearch} />, [openSearch]);

  return (
    <>
      <ScrollToTop />
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      <Switch>
        <Route path="/" component={HomeRoute} />
        <Route path="/page/:page" component={HomeRoute} />
        <Route path="/categories" component={CategoriesRoute} />
        <Route path="/categories/:category" component={CategoriesRoute} />
        <Route path="/tags" component={TagsRoute} />
        <Route path="/tags/:tag" component={TagsRoute} />
        <Route path="/links" component={LinksRoute} />
        <Route path="/about" component={AboutRoute} />
        <Route path="/posts/:id" component={PostRoute} />
        <Route path="/template" component={TemplateRoute} />
        <Route path="/timeline" component={TimelineRoute} />
        <Route component={NotFoundRoute} />
      </Switch>
      <Toaster />
    </>
  );
}