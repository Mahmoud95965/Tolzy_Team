'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SCENES } from '../data';
import Scene1Hook from './Scene1Hook';
import Scene2Compare from './Scene2Compare';
import Scene3Mention from './Scene3Mention';
import Scene4StacksPoll from './Scene4StacksPoll';
import Scene5Outro from './Scene5Outro';
import DynamicCaptions from './DynamicCaptions';
import SafeZonesOverlay from './SafeZonesOverlay';

interface ReelsStageProps {
  currentTime: number;
  showSafeZones: boolean;
  showCaptions: boolean;
  cleanMode?: boolean;
}

export default function ReelsStage({
  currentTime,
  showSafeZones,
  showCaptions,
  cleanMode = false,
}: ReelsStageProps) {
  // Determine current active scene
  const activeSceneIndex = SCENES.findIndex(
    (s, idx) => currentTime >= s.start && (idx === SCENES.length - 1 ? currentTime <= s.end : currentTime < s.end)
  );
  const currentScene = SCENES[activeSceneIndex !== -1 ? activeSceneIndex : SCENES.length - 1];

  // Calculate normalized progress within the active scene [0, 1]
  const sceneProgress = Math.min(
    1,
    Math.max(0, (currentTime - currentScene.start) / currentScene.duration)
  );

  return (
    <div className="relative flex items-center justify-center">
      {/* Dynamic Ambient Glow framing the phone */}
      {!cleanMode && (
        <div
          className="absolute -inset-8 rounded-[48px] opacity-40 blur-3xl transition-colors duration-1000 -z-10 pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${currentScene.themeColor}40 0%, transparent 70%)`,
          }}
        />
      )}

      {/* 9:16 Mobile Phone Frame */}
      <div
        id="reels-stage-container"
        className={`relative overflow-hidden transition-all duration-300 ${
          cleanMode
            ? 'w-[420px] h-[746px] rounded-[36px] shadow-2xl'
            : 'w-[380px] h-[675px] rounded-[42px] border-[6px] border-[#1f2233] shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_30px_rgba(254,166,25,0.15)] ring-1 ring-white/10'
        } bg-[#090A0F]`}
      >
        {/* Phone Speaker & Camera Island */}
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-50 w-24 h-4 bg-black/80 rounded-full border border-white/10 flex items-center justify-center gap-1.5 pointer-events-none">
          <div className="w-2 h-2 rounded-full bg-[#181a24] border border-white/10" />
          <div className="w-7 h-1 rounded-full bg-white/20" />
        </div>

        {/* Scene Renderer Switcher */}
        <div className="relative w-full h-full">
          {currentScene.id === 1 && <Scene1Hook progress={sceneProgress} />}
          {currentScene.id === 2 && <Scene2Compare progress={sceneProgress} />}
          {currentScene.id === 3 && <Scene3Mention progress={sceneProgress} />}
          {currentScene.id === 4 && <Scene4StacksPoll progress={sceneProgress} />}
          {currentScene.id === 5 && <Scene5Outro progress={sceneProgress} />}
        </div>

        {/* Synchronized Dynamic Captions */}
        <DynamicCaptions currentTime={currentTime} visible={showCaptions} />

        {/* Safe Zones Guideline Overlay */}
        <SafeZonesOverlay visible={showSafeZones} />
      </div>
    </div>
  );
}
