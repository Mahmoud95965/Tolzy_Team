'use client';

import React, { useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Upload,
  Volume2,
  VolumeX,
  Download,
  Film,
  Sparkles,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
  Layers,
  CheckCircle,
  FileAudio,
  Radio,
} from 'lucide-react';
import { SCENES, TOTAL_DURATION } from '../data';
import { ExportProgress } from './CanvasVideoExporter';

interface StudioControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  isLooping: boolean;
  showSafeZones: boolean;
  showCaptions: boolean;
  cleanMode: boolean;
  audioFileName: string;
  exportProgress: ExportProgress | null;
  isExporting: boolean;
  onPlayPause: () => void;
  onReset: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  onPlaybackRateChange: (rate: number) => void;
  onToggleLoop: () => void;
  onToggleSafeZones: () => void;
  onToggleCaptions: () => void;
  onToggleCleanMode: () => void;
  onAudioUpload: (file: File) => void;
  onLoadDefaultAudio: () => void;
  onExportVideo: () => void;
}

export default function StudioControls({
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  playbackRate,
  isLooping,
  showSafeZones,
  showCaptions,
  cleanMode,
  audioFileName,
  exportProgress,
  isExporting,
  onPlayPause,
  onReset,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onPlaybackRateChange,
  onToggleLoop,
  onToggleSafeZones,
  onToggleCaptions,
  onToggleCleanMode,
  onAudioUpload,
  onLoadDefaultAudio,
  onExportVideo,
}: StudioControlsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 10);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onAudioUpload(e.target.files[0]);
    }
  };

  return (
    <div
      dir="rtl"
      className="w-full lg:w-[440px] flex flex-col gap-4 p-5 rounded-3xl bg-[#0d0f17]/90 backdrop-blur-2xl border border-white/10 shadow-2xl text-white select-none max-h-[92vh] overflow-y-auto"
    >
      {/* Studio Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-lime-400 p-0.5 shadow-md">
            <div className="w-full h-full rounded-[10px] bg-black flex items-center justify-center font-black text-amber-400 text-sm">
              T
            </div>
          </div>
          <div>
            <h2 className="text-base font-black text-white leading-tight">استوديو ريلز تولزي</h2>
            <p className="text-[11px] text-white/50 font-mono">1080x1920 • 9:16 HD Exporter</p>
          </div>
        </div>
        <span className="flex items-center gap-1 text-[10px] bg-lime-400/10 text-lime-400 border border-lime-400/30 px-2 py-0.5 rounded-full font-bold">
          <Radio className="w-3 h-3 animate-pulse" /> متزامن مع الصوت
        </span>
      </div>

      {/* 1. Voiceover Audio Loader Section */}
      <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white/80 flex items-center gap-1.5">
            <FileAudio className="w-4 h-4 text-amber-400" />
            ملف التعليق الصوتي (Voiceover)
          </span>
          <button
            onClick={onLoadDefaultAudio}
            className="text-[10px] font-bold text-amber-300 hover:text-white transition-colors bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-lg"
          >
            الصوت الافتراضي (37s)
          </button>
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-sm">🎙️</span>
            <span className="text-xs font-mono text-white/90 truncate max-w-[200px]">
              {audioFileName || 'tolzy-reels-voiceover.mp3'}
            </span>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 text-xs font-bold bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded-lg border border-white/10 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>رفع صوت</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/mp3,audio/wav,audio/m4a,audio/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {/* 2. Timeline Scrubber & Main Playback Controls */}
      <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
        {/* Timestamp & Progress */}
        <div className="flex items-center justify-between font-mono text-xs text-white/70">
          <span className="font-bold text-amber-300">{formatTime(currentTime)}</span>
          <span className="text-[11px] text-white/40">المدة الإجمالية: {formatTime(duration)}</span>
        </div>

        {/* Custom Range Slider */}
        <input
          type="range"
          min="0"
          max={duration}
          step="0.05"
          value={currentTime}
          onChange={(e) => onSeek(parseFloat(e.target.value))}
          className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-amber-400"
        />

        {/* Playback Buttons Bar */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <button
              onClick={onPlayPause}
              className="w-11 h-11 rounded-xl bg-gradient-to-r from-amber-500 to-lime-400 text-black flex items-center justify-center font-black shadow-[0_0_20px_rgba(254,166,25,0.4)] hover:scale-105 active:scale-95 transition-all"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-black" /> : <Play className="w-5 h-5 fill-black mr-0.5" />}
            </button>
            <button
              onClick={onReset}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border border-white/10 transition-colors"
              title="إعادة للبداية"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <button onClick={onToggleMute} className="text-white/70 hover:text-white">
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-16 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-lime-400"
            />
          </div>

          {/* Speed Selector */}
          <select
            value={playbackRate}
            onChange={(e) => onPlaybackRateChange(parseFloat(e.target.value))}
            className="bg-black/40 border border-white/10 text-white text-xs rounded-lg px-2 py-1 font-mono focus:outline-none"
          >
            <option value="0.5">0.5x</option>
            <option value="1">1.0x</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x</option>
          </select>
        </div>
      </div>

      {/* 3. Scene Jumpers (5 Vertical Scenes) */}
      <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
        <span className="text-xs font-bold text-white/80">المشاهد الخمسة (Scenes):</span>
        <div className="grid grid-cols-1 gap-1.5">
          {SCENES.map((scene, idx) => {
            const isCurrent =
              idx === SCENES.length - 1
                ? currentTime >= scene.start && currentTime <= scene.end
                : currentTime >= scene.start && currentTime < scene.end;
            return (
              <button
                key={scene.id}
                onClick={() => onSeek(scene.start)}
                className={`flex items-center justify-between p-2 rounded-xl text-xs transition-all ${
                  isCurrent
                    ? 'bg-white/15 border border-white/30 text-white shadow-md font-bold'
                    : 'bg-white/5 hover:bg-white/10 text-white/70 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: scene.themeColor }}
                  />
                  <span>
                    مشهد {scene.id}: {scene.title}
                  </span>
                </div>
                <span className="font-mono text-[10px] text-white/40">
                  {scene.start}s - {scene.end}s
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Toggles & Display Modes */}
      <div className="grid grid-cols-3 gap-2">
        {/* Safe Zones */}
        <button
          onClick={onToggleSafeZones}
          className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-center transition-all ${
            showSafeZones
              ? 'bg-red-500/20 border-red-500/50 text-red-300'
              : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
          }`}
        >
          <Layers className="w-4 h-4 mb-1" />
          <span className="text-[10px] font-bold">منطقة الأمان</span>
        </button>

        {/* Dynamic Captions */}
        <button
          onClick={onToggleCaptions}
          className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-center transition-all ${
            showCaptions
              ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
              : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
          }`}
        >
          <Sparkles className="w-4 h-4 mb-1" />
          <span className="text-[10px] font-bold">الترجمة المتحركة</span>
        </button>

        {/* Clean Mode */}
        <button
          onClick={onToggleCleanMode}
          className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-center transition-all ${
            cleanMode
              ? 'bg-sky-500/20 border-sky-500/50 text-sky-300'
              : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
          }`}
        >
          {cleanMode ? <Minimize2 className="w-4 h-4 mb-1" /> : <Maximize2 className="w-4 h-4 mb-1" />}
          <span className="text-[10px] font-bold">معاينة نظيفة</span>
        </button>
      </div>

      {/* 5. Big Video & Audio Export Section */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 via-white/5 to-lime-500/15 border border-amber-400/30 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
            <Film className="w-4 h-4" />
            تصدير فيديو عالي الدقة (1080x1920)
          </span>
          <span className="text-[10px] font-mono text-white/60">MP4 / 60 FPS</span>
        </div>

        {/* Export Progress Bar */}
        {isExporting && exportProgress && (
          <div className="space-y-1.5 p-3 rounded-xl bg-black/60 border border-amber-400/40">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-amber-300 font-bold">
                {Math.round(exportProgress.progress * 100)}%
              </span>
              <span className="text-white/60">
                إطار {exportProgress.currentFrame} / {exportProgress.totalFrames}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-lime-400 transition-all duration-150"
                style={{ width: `${exportProgress.progress * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-white/70 text-center font-medium animate-pulse">
              {exportProgress.status}
            </p>
          </div>
        )}

        {/* Big Export Trigger Button */}
        <button
          disabled={isExporting}
          onClick={onExportVideo}
          className={`w-full py-3 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-xl transition-all ${
            isExporting
              ? 'bg-neutral-800 text-white/40 cursor-not-allowed'
              : 'bg-gradient-to-r from-amber-500 via-amber-400 to-lime-400 text-black hover:opacity-95 shadow-[0_0_25px_rgba(254,166,25,0.4)] active:scale-[0.98]'
          }`}
        >
          <Download className="w-4 h-4 stroke-[2.5]" />
          <span>{isExporting ? 'جاري الرندرة والتصدير...' : 'تصدير وتحميل الفيديو (Export MP4)'}</span>
        </button>
      </div>
    </div>
  );
}
