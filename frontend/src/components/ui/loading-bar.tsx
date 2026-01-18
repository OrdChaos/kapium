import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { useEffect } from "react";
import { useLocation } from "wouter";

NProgress.configure({
  showSpinner: false,
  trickleSpeed: 120,
  minimum: 0.1,
})

export default function LoadingBar() {
  const [location] = useLocation()

  useEffect(() => {
    NProgress.start();
    NProgress.done();

    return;
  }, [location]);

  return null;
}