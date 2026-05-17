import { Route, Switch, useLocation, useParams } from 'wouter';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { Toaster } from '@/components/ui/sonner';
import UmamiAnalytics from '@danielgtmn/umami-react';

import SearchDialog from '@/components/SearchDialog';
import ScrollToTop from '@/components/ScrollToTop';
import LoadingBar from '@/components/ui/loading-bar';
import { LoadingProvider } from '@/contexts/LoadingContext';
import HomePage from '@/pages/HomePage';
import CategoriesPage from '@/pages/CategoriesPage';
import TagsPage from '@/pages/TagsPage';
import LinksPage from '@/pages/LinksPage';
import AboutPage from '@/pages/AboutPage';
import PostPage from '@/pages/PostPage';
import TemplatePage from '@/pages/TemplatePage';
import TimelinePage from '@/pages/TimelinePage';
import FeedPage from '@/pages/FeedPage';
import NotFoundPage from '@/pages/NotFoundPage';
import OfflinePage from '@/pages/OfflinePage';
import RedirectPage from '@/pages/RedirectPage';
import PrivacyPolicyPage from '@/pages/PrivacyPolicyPage';
import CookiesPolicyPage from '@/pages/CookiesPolicyPage';
import CopyrightPolicyPage from '@/pages/CopyrightPolicyPage';

function PageRoute({ onSearchClick }: { onSearchClick: () => void }) {
  const [, navigate] = useLocation();
  const params = useParams();
  const [posts, setPosts] = useState<any[] | null>(null);
  const [shouldShowNotFound, setShouldShowNotFound] = useState(false);
  const [validPage, setValidPage] = useState<number | null>(null);

  useEffect(() => {
    fetch('/data/posts.json')
      .then(res => res.json())
      .then(data => setPosts(data))
      .catch(() => setPosts([]));
  }, []);

  useEffect(() => {
    if (posts === null) return;

    const pageStr = params.page;
    if (!pageStr) {
      setShouldShowNotFound(true);
      return;
    }

    const pageNum = parseInt(pageStr, 10);
    
    if (isNaN(pageNum) || pageNum < 1 || !/^\d+$/.test(pageStr)) {
      setShouldShowNotFound(true);
      return;
    }

    if (pageNum === 1) {
      navigate('/');
      return;
    }

    const postsPerPage = 21;
    const totalPages = Math.ceil(posts.length / postsPerPage);
    
    if (pageNum > totalPages) {
      setShouldShowNotFound(true);
      return;
    }

    setValidPage(pageNum);
  }, [posts, params.page, navigate]);

  if (posts === null) {
    return null;
  }

  if (shouldShowNotFound) {
    return <NotFoundPage onSearchClick={onSearchClick} />;
  }

  if (validPage !== null) {
    return <HomePage onSearchClick={onSearchClick} initialPage={validPage} />;
  }

  return null;
}

export default function App() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const openSearch = useCallback(() => setSearchOpen(true), [setSearchOpen]);

  const HomeRoute = useCallback(() => <HomePage onSearchClick={openSearch} />, [openSearch]);
  const CategoriesRoute = useCallback(() => <CategoriesPage onSearchClick={openSearch} />, [openSearch]);
  const TagsRoute = useCallback(() => <TagsPage onSearchClick={openSearch} />, [openSearch]);
  const LinksRoute = useCallback(() => <LinksPage onSearchClick={openSearch} />, [openSearch]);
  const AboutRoute = useCallback(() => <AboutPage onSearchClick={openSearch} />, [openSearch]);
  const PostRoute = useCallback(() => <PostPage onSearchClick={openSearch} />, [openSearch]);
  const TemplateRoute = useCallback(() => <TemplatePage onSearchClick={openSearch} />, [openSearch]);
  const TimelineRoute = useCallback(() => <TimelinePage onSearchClick={openSearch} />, [openSearch]);
  const FeedRoute = useCallback(() => <FeedPage onSearchClick={openSearch} />, [openSearch]);
  const NotFoundRoute = useCallback(() => <NotFoundPage onSearchClick={openSearch} />, [openSearch]);
  const OfflineRoute = useCallback(() => <OfflinePage onSearchClick={openSearch} />, [openSearch]);
  const RedirectRoute = useCallback(() => <RedirectPage onSearchClick={openSearch} />, [openSearch]);
  const PrivacyPolicyRoute = useCallback(() => <PrivacyPolicyPage onSearchClick={openSearch} />, [openSearch]);
  const CookiesPolicyRoute = useCallback(() => <CookiesPolicyPage onSearchClick={openSearch} />, [openSearch]);
  const CopyrightPolicyRoute = useCallback(() => <CopyrightPolicyPage onSearchClick={openSearch} />, [openSearch]);

  if (!isOnline) {
    return (
      <>
        <UmamiAnalytics
          url={import.meta.env.VITE_UMAMI_API_URL}
          websiteId={import.meta.env.VITE_UMAMI_WEBSITE_ID}
          lazyLoad={true}
        />
        <ScrollToTop />
        <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
        <OfflineRoute />
        <Toaster />
      </>
    );
  }

  return (
    <LoadingProvider>
      <UmamiAnalytics
        url={import.meta.env.VITE_UMAMI_API_URL}
        websiteId={import.meta.env.VITE_UMAMI_WEBSITE_ID}
        lazyLoad={true}
      />
      <LoadingBar />
      <ScrollToTop />
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      <Switch>
        <Route path="/" component={HomeRoute} />
        <Route path="/page/:page">
          <PageRoute onSearchClick={openSearch} />
        </Route>
        <Route path="/categories" component={CategoriesRoute} />
        <Route path="/categories/:category" component={CategoriesRoute} />
        <Route path="/tags" component={TagsRoute} />
        <Route path="/tags/:tag" component={TagsRoute} />
        <Route path="/links" component={LinksRoute} />
        <Route path="/about" component={AboutRoute} />
        <Route path="/posts/:id" component={PostRoute} />
        <Route path="/template" component={TemplateRoute} />
        <Route path="/timeline" component={TimelineRoute} />
        <Route path="/feed" component={FeedRoute} />
        <Route path="/redirect" component={RedirectRoute} />
        <Route path="/privacy-policy" component={PrivacyPolicyRoute} />
        <Route path="/cookies-policy" component={CookiesPolicyRoute} />
        <Route path="/copyright-policy" component={CopyrightPolicyRoute} />
        <Route component={NotFoundRoute} />
      </Switch>
      <Toaster />
    </LoadingProvider>
  );
}