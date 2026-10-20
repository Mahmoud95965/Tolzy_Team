'use client';

import React, { useState, useEffect, useRef } from 'react';
import ReelsStage from './ReelsStage';
import StudioControls from './StudioControls';
import { CanvasVideoExporter, ExportProgress } from './CanvasVideoExporter';
import { TOTAL_DURATION } from '../data';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { ArrowRight, Sparkles, Video, HelpCircle } from 'lucide-react';

export default function ReelsStudio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(TOTAL_DURATION);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLooping, setIsLooping] = useState(false);

  // Studio Display Toggles
  const [showSafeZones, setShowSafeZones] = useState(false);
  const [showCaptions, setShowCaptions] = useState(true);
  const [cleanMode, setCleanMode] = useState(false);

  // Audio state
  const [audioSrc, setAudioSrc] = useState('/tolzy-reels-voiceover.mp3');
  const [audioFileName, setAudioFileName] = useState('tolzy-reels-voiceover.mp3');

  // Export state
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const exporterRef = useRef<CanvasVideoExporter | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Initialize CanvasVideoExporter
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        exporterRef.current = new CanvasVideoExporter();
      } catch (err) {
        console.warn('CanvasVideoExporter init warning:', err);
      }
    }
  }, []);

  // Animation frame loop locked to audio.currentTime
  const updateTick = () => {
    if (audioRef.current) {
      const cur = audioRef.current.currentTime;
      setCurrentTime(cur);

      if (cur >= (audioRef.current.duration || TOTAL_DURATION)) {
        if (isLooping) {
          audioRef.current.currentTime = 0;
          audioRef.current.play();
        } else {
          setIsPlaying(false);
          audioRef.current.pause();
        }
      } else {
        animFrameRef.current = requestAnimationFrame(updateTick);
      }
    }
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    } else {
      if (audioRef.current.currentTime >= (audioRef.current.duration || TOTAL_DURATION)) {
        audioRef.current.currentTime = 0;
      }
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          animFrameRef.current = requestAnimationFrame(updateTick);
        })
        .catch((err) => {
          console.warn('Playback error:', err);
          toast.error('يرجى التفاعل مع الصفحة لبدء تشغيل الصوت');
        });
    }
  };

  const handleReset = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      setIsPlaying(false);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    }
  };

  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (vol: number) => {
    setVolume(vol);
    setIsMuted(vol === 0);
    if (audioRef.current) {
      audioRef.current.volume = vol;
      audioRef.current.muted = vol === 0;
    }
  };

  const handleToggleMute = () => {
    if (!audioRef.current) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioRef.current.muted = nextMuted;
  };

  const handlePlaybackRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const handleAudioUpload = (file: File) => {
    const objectUrl = URL.createObjectURL(file);
    setAudioSrc(objectUrl);
    setAudioFileName(file.name);
    handleReset();
    toast.success(`تم تحميل ملف الصوت: ${file.name}`);
  };

  const handleLoadDefaultAudio = () => {
    setAudioSrc('/tolzy-reels-voiceover.mp3');
    setAudioFileName('tolzy-reels-voiceover.mp3');
    handleReset();
    toast.success('تم تعيين الصوت الافتراضي (37s)');
  };

  const handleExportVideo = async () => {
    if (!audioRef.current) {
      toast.error('عنصر الصوت غير جاهز');
      return;
    }

    if (!exporterRef.current) {
      exporterRef.current = new CanvasVideoExporter();
    }

    try {
      setIsExporting(true);
      handleReset();
      toast.loading('بدأ تسجيل الفيديو بدقة 1080x1920 وبمعدل 60fps...', { id: 'export-toast' });

      const blob = await exporterRef.current.exportVideo(audioRef.current, (progress) => {
        setExportProgress(progress);
      });

      // Trigger instant download
      const ext = blob.type.includes('mp4') ? 'mp4' : 'webm';
      const filename = `tolzy-reels-1080x1920.${ext}`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`تم إنشاء وتحميل الفيديو بنجاح: ${filename}! 🚀`, { id: 'export-toast' });
    } catch (err: any) {
      console.error('Export failed:', err);
      toast.error(`حدث خطأ أثناء التصدير: ${err.message || 'خطأ غير معروف'}`, { id: 'export-toast' });
    } finally {
      setIsExporting(false);
      setExportProgress(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#07080c] text-white flex flex-col justify-between selection:bg-amber-500 selection:text-black">
      {/* Hidden Audio Element with Web Audio API Support */}
      <audio
        ref={audioRef}
        src={audioSrc}
        preload="auto"
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration || TOTAL_DURATION);
          }
        }}
        onEnded={() => {
          if (!isLooping) setIsPlaying(false);
        }}
      />

      {/* Top Navbar */}
      {!cleanMode && (
        <header
          dir="rtl"
          className="w-full border-b border-white/10 bg-[#090A0F]/80 backdrop-blur-xl px-6 py-3.5 flex items-center justify-between z-30"
        >
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-xs font-bold text-white/70 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>العودة للمنصة</span>
            </Link>

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <h1 className="text-sm font-black text-white">
                TOLZY <span className="text-amber-400">Reels Studio</span> ⚡
              </h1>
              <span className="text-[10px] font-mono bg-lime-400/20 text-lime-300 border border-lime-400/30 px-2 py-0.5 rounded-full">
                9:16 Vertical HD
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-white/60">
            <span className="hidden sm:inline">دقة العمل: 1080x1920 (60fps)</span>
            <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
            <span className="text-amber-300 font-bold">5 مشاهد احترافية</span>
          </div>
        </header>
      )}

      {/* Main Studio Workspace: 9:16 Center Stage + Control Sidebar */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 z-10">
        {/* 9:16 Preview Stage */}
        <div className="flex flex-col items-center">
          <ReelsStage
            currentTime={currentTime}
            showSafeZones={showSafeZones}
            showCaptions={showCaptions}
            cleanMode={cleanMode}
          />

          {/* Quick status under stage */}
          <div className="mt-3 flex items-center gap-3 text-[11px] text-white/50 font-mono">
            <span>Stage: 9:16 Mobile HD</span>
            <span>•</span>
            <span>{showSafeZones ? '⚠️ مناطق الأمان مفعلة' : 'شاشة كاملة'}</span>
          </div>
        </div>

        {/* Studio Control Sidebar */}
        <StudioControls
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          isMuted={isMuted}
          playbackRate={playbackRate}
          isLooping={isLooping}
          showSafeZones={showSafeZones}
          showCaptions={showCaptions}
          cleanMode={cleanMode}
          audioFileName={audioFileName}
          exportProgress={exportProgress}
          isExporting={isExporting}
          onPlayPause={handlePlayPause}
          onReset={handleReset}
          onSeek={handleSeek}
          onVolumeChange={handleVolumeChange}
          onToggleMute={handleToggleMute}
          onPlaybackRateChange={handlePlaybackRateChange}
          onToggleLoop={() => setIsLooping(!isLooping)}
          onToggleSafeZones={() => setShowSafeZones(!showSafeZones)}
          onToggleCaptions={() => setShowCaptions(!showCaptions)}
          onToggleCleanMode={() => setCleanMode(!cleanMode)}
          onAudioUpload={handleAudioUpload}
          onLoadDefaultAudio={handleLoadDefaultAudio}
          onExportVideo={handleExportVideo}
        />
      </main>

      {/* Minimal Footer */}
      {!cleanMode && (
        <footer
          dir="rtl"
          className="border-t border-white/5 py-3 px-6 text-center text-xs text-white/40 flex items-center justify-between"
        >
          <span>منصة TOLZY 2026 • استوديو إنتاج الريلز والفيديوهات العمودية</span>
          <span className="font-mono text-[11px]">Next.js • Framer Motion • HTML5 Canvas • WebCodecs</span>
        </footer>
      )}
    </div>
  );
}
