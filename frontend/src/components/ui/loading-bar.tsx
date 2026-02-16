import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { useLoading } from "@/contexts/LoadingContext";

NProgress.configure({
  showSpinner: false,
  trickleSpeed: 120,
  minimum: 0.1,
})

export default function LoadingBar() {
  const [location] = useLocation()
  const { completeLoading } = useLoading()

  useEffect(() => {
    NProgress.start();
    // 不在这里立即完成，等页面组件调用 completeLoading()

    return () => {
      // 路由变化时取消之前的加载
      completeLoading()
    };
  }, [location, completeLoading]);

  return null;
}