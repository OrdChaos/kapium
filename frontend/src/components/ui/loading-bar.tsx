import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { useLoading } from "@/contexts/LoadingContext";

NProgress.configure({
  showSpinner: false,
  trickleSpeed: 120,
  minimum: 0.1,
  speed: 300, // 添加完成动画速度
})

export default function LoadingBar() {
  const [location] = useLocation()
  const { startLoading, completeLoading, isLoading } = useLoading()

  useEffect(() => {
    // 路由变化时开始新的加载
    startLoading();

    // 返回清理函数
    return () => {
      // 路由变化时完成之前的加载
      completeLoading();
    };
  }, [location, startLoading, completeLoading]);

  // 当isLoading为false时，确保进度条完成
  useEffect(() => {
    if (!isLoading) {
      completeLoading();
    }
  }, [isLoading, completeLoading]);

  return null;
}