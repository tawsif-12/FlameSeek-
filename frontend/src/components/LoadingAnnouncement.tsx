import { useEffect, useLayoutEffect, useState, useSyncExternalStore } from "react";
import { useLocation } from "react-router-dom";
import { clearLoading, loadingSnapshot, subscribeLoading } from "../api/loading";
import "./LoadingAnnouncement.css";
export default function LoadingAnnouncement() {
 const location = useLocation();
 const tasks = useSyncExternalStore(subscribeLoading, loadingSnapshot, loadingSnapshot);
 const [now, setNow] = useState(Date.now());
 const [atTop, setAtTop] = useState(true);
 useEffect(() => {
   const update = () => setAtTop(Math.max(window.scrollY, document.documentElement.scrollTop, document.body.scrollTop, document.getElementById("root")?.scrollTop || 0) < 8);
   update();
   window.addEventListener("scroll", update, true);
   return () => window.removeEventListener("scroll", update, true);
 }, []);
 useLayoutEffect(() => { clearLoading(); }, [location.pathname, location.search]);
 useEffect(() => { if (!tasks.length) return; setNow(Date.now()); const timer = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(timer); }, [tasks]);
 if (!atTop || !tasks.length || now - Math.min(...tasks.map(task => task.started)) < 1000) return null;
 const seconds = Math.max(0, Math.floor((now - Math.min(...tasks.map(task => task.started))) / 1000));
 const elapsed = seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
 return <div className="loading-announcement" role="status" aria-live="polite"><span className="loading-announcement__text">{tasks[0].reason} · Elapsed: {elapsed} · Load time varies with the data provider and your connection</span></div>;
}
