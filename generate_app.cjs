// Premium Generator for The Future of TOLZY (9:16 Mobile Motion Graphics & Video Exporter)
const fs = require('fs');
const path = require('path');

console.log('Reading official voiceover audio...');
const audioBuffer = fs.readFileSync(path.join(__dirname, 'tolzy_future.mp3'));
const audioBase64 = audioBuffer.toString('base64');
console.log('Audio file loaded. Base64 length:', audioBase64.length);

const htmlTemplate = `<!DOCTYPE html>
<html lang="ar" dir="rtl" class="h-full bg-[#0E0E0D]">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>TOLZY • The Future of TOLZY | Motion Graphics 9:16</title>
  
  <!-- Premium Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700;800&family=Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:wght@500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">

  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            brand: {
              cream: '#FAF8F5',
              charcoal: '#181816',
              coral: '#D97757',
              blue: '#4285F4',
              emerald: '#2E8B57',
              amber: '#D49A38',
              surface: '#FFFFFF',
              border: '#E8E4DD'
            }
          },
          fontFamily: {
            arabic: ['"IBM Plex Sans Arabic"', 'system-ui', 'sans-serif'],
            sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
            serif: ['"Instrument Serif"', 'Georgia', 'serif'],
            mono: ['"JetBrains Mono"', 'monospace']
          }
        }
      }
    }
  </script>

  <style>
    body {
      font-family: 'IBM Plex Sans Arabic', sans-serif;
      background-color: #0E0E0D;
      color: #FAF8F5;
      overflow-x: hidden;
      touch-action: manipulation;
      user-select: none;
      -webkit-user-select: none;
    }

    .font-serif-accent {
      font-family: 'Instrument Serif', Georgia, serif;
    }

    .font-eng {
      font-family: 'Plus Jakarta Sans', sans-serif;
    }

    /* Strict 9:16 Smartphone Shell */
    .phone-viewport {
      aspect-ratio: 9 / 16;
      max-height: 94vh;
      width: min(440px, 98vw);
      position: relative;
      border-radius: 46px;
      overflow: hidden;
      box-shadow: 0 0 0 12px #1E1E1C, 0 0 0 14px #2D2D2A, 0 35px 80px -15px rgba(0, 0, 0, 0.8), 0 0 50px rgba(217, 119, 87, 0.12);
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @media (max-width: 640px) {
      .phone-viewport {
        border-radius: 0px !important;
        box-shadow: none !important;
        max-height: 100dvh !important;
        width: 100vw !important;
        height: 100dvh !important;
        aspect-ratio: auto !important;
      }
      .desktop-only {
        display: none !important;
      }
    }

    /* Dynamic Island notch */
    .dynamic-island {
      position: absolute;
      top: 14px;
      left: 50%;
      transform: translateX(-50%);
      width: 110px;
      height: 28px;
      background-color: #000;
      border-radius: 20px;
      z-index: 40;
      pointer-events: none;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
    }

    /* Studio UI Transition & Clean Mode */
    .studio-fade {
      transition: opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1), transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .clean-mode .studio-fade {
      opacity: 0 !important;
      pointer-events: none !important;
      transform: translateY(-12px) scale(0.98);
    }
    .clean-mode #subtitlesPillContainer {
      display: none !important;
    }

    /* Glassmorphism */
    .glass-panel {
      background: rgba(24, 24, 22, 0.85);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    /* Slider styling */
    input[type=range] {
      -webkit-appearance: none;
      background: rgba(255, 255, 255, 0.15);
      border-radius: 999px;
      height: 5px;
    }
    input[type=range]::-webkit-slider-thumb {
      -webkit-appearance: none;
      height: 14px;
      width: 14px;
      border-radius: 50%;
      background: #D97757;
      cursor: pointer;
      box-shadow: 0 0 10px rgba(217, 119, 87, 0.7);
    }
  </style>
</head>
<body class="h-full flex flex-col items-center justify-between p-0 sm:p-4 text-brand-charcoal overflow-hidden">

  <!-- TOP STUDIO TOOLBAR -->
  <header id="studioToolbar" class="studio-fade w-full max-w-5xl z-50 flex items-center justify-between py-2.5 px-4 rounded-2xl glass-panel text-white text-xs mb-2 shadow-2xl">
    <div class="flex items-center gap-3">
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-brand-coral animate-pulse"></span>
        <span class="font-eng font-extrabold tracking-wider text-sm bg-gradient-to-r from-white via-[#FAF8F5] to-brand-coral bg-clip-text text-transparent">TOLZY</span>
      </div>
      <span class="bg-white/10 px-2 py-0.5 rounded text-[11px] font-mono text-white/80">9:16 MOTION</span>
      <span id="activeSceneBadge" class="hidden sm:inline-block bg-brand-coral/20 text-brand-coral border border-brand-coral/30 px-2.5 py-0.5 rounded-full font-bold">
        المشهد ١: الزحام والمشكلتان
      </span>
    </div>

    <!-- Timeline Scrubber & Controls -->
    <div class="flex items-center gap-3">
      <button id="btnPlayPause" onclick="togglePlayPause()" class="p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition flex items-center gap-1.5 font-bold" title="تشغيل / إيقاف (Space)">
        <svg id="playIcon" class="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        <svg id="pauseIcon" class="w-4 h-4 fill-white hidden" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
      </button>

      <span id="timeDisplay" class="font-mono text-white/90 text-xs w-24 text-center">00:00 / 02:39</span>

      <!-- Scene Quick Jumps -->
      <div class="hidden lg:flex items-center gap-1 bg-white/5 p-1 rounded-xl">
        <button onclick="jumpToScene(1)" class="px-2 py-1 rounded hover:bg-white/10 text-[11px] text-white/70 hover:text-white transition">١. الزحام</button>
        <button onclick="jumpToScene(2)" class="px-2 py-1 rounded hover:bg-white/10 text-[11px] text-white/70 hover:text-white transition">٢. التحول</button>
        <button onclick="jumpToScene(3)" class="px-2 py-1 rounded hover:bg-white/10 text-[11px] text-white/70 hover:text-white transition">٣. tolzy.me</button>
        <button onclick="jumpToScene(4)" class="px-2 py-1 rounded hover:bg-white/10 text-[11px] text-white/70 hover:text-white transition">٤. Flow</button>
        <button onclick="jumpToScene(5)" class="px-2 py-1 rounded hover:bg-white/10 text-[11px] text-white/70 hover:text-white transition">٥. Agri Lab</button>
        <button onclick="jumpToScene(6)" class="px-2 py-1 rounded hover:bg-white/10 text-[11px] text-white/70 hover:text-white transition">٦. الخاتمة</button>
      </div>
    </div>

    <!-- Actions & Video Export -->
    <div class="flex items-center gap-2">
      <!-- Toggle Subtitles -->
      <button id="btnToggleSubs" onclick="toggleSubtitles()" class="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition flex items-center gap-1 text-[11px]" title="الترجمة النصية (S)">
        <span>💬 الترجمة: </span>
        <span id="subsState" class="font-bold text-brand-coral">مفعلة</span>
      </button>

      <!-- Clean Recording Mode -->
      <button onclick="toggleCleanMode()" class="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition flex items-center gap-1 text-[11px]" title="وضع التسجيل النقي (H)">
        <span>👁️ إخفاء الواجهة</span>
      </button>

      <!-- EXPORT VIDEO BUTTON (Strictly required) -->
      <button id="btnExportVideo" onclick="startExport()" class="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-brand-coral to-[#E25C38] text-white font-bold hover:brightness-110 active:scale-95 transition flex items-center gap-1.5 shadow-lg shadow-brand-coral/30">
        <svg class="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
        <span>🎬 تصدير فيديو (MP4)</span>
      </button>
    </div>
  </header>

  <!-- RECORDING ACTIVE FLOATING BAR (Appears during automated video export) -->
  <div id="recordingStatusBar" class="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full glass-panel text-white text-xs font-mono flex items-center gap-3 shadow-2xl transition-all duration-300 opacity-0 pointer-events-none">
    <span class="w-3 h-3 rounded-full bg-red-500 animate-ping"></span>
    <span class="font-bold text-red-400">REC 1080×1920 (60FPS)</span>
    <span id="recProgressText" class="text-white/80">00:00 / 02:39 (0%)</span>
    <button onclick="cancelExport()" class="bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded text-[10px] text-white transition pointer-events-auto">
      إلغاء
    </button>
  </div>

  <!-- MAIN STAGE / PHONE VIEWPORT -->
  <main class="relative flex-1 flex items-center justify-center w-full min-h-0">
    <div id="phoneViewport" class="phone-viewport bg-brand-cream relative flex flex-col justify-between">
      
      <!-- Dynamic Island for Realistic Mobile Shell -->
      <div class="dynamic-island desktop-only"></div>

      <!-- Native 1080x1920 60FPS Stage Canvas -->
      <canvas id="stageCanvas" width="1080" height="1920" class="w-full h-full block object-contain"></canvas>

      <!-- Clean Mode Overlay Exit Trigger -->
      <div id="cleanModeNotice" class="hidden absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-black/80 backdrop-blur text-white text-xs rounded-full pointer-events-none transition-opacity duration-500 opacity-0 z-50">
        وضع التسجيل النقي نشط (اضغط H للعودة)
      </div>

      <!-- Touch Layer for Mobile Scrubbing & Tap to Play -->
      <div id="touchLayer" class="absolute inset-0 z-30 cursor-pointer" onclick="togglePlayPause()"></div>

      <!-- Floating Subtitles Pill (Reels Style) -->
      <div id="subtitlesPillContainer" class="absolute bottom-[92px] left-4 right-4 z-40 flex justify-center pointer-events-none transition-all duration-300">
        <div id="subtitlesPill" class="max-w-[92%] px-4 py-2.5 rounded-2xl bg-[#181816]/90 backdrop-blur-md border border-white/10 text-center shadow-2xl transition-all duration-200">
          <p id="subtitlesText" class="text-[13.5px] leading-relaxed text-[#FAF8F5] font-arabic font-medium tracking-wide">
            عالم الذكاء الاصطناعي بيتحرك بسرعة مذهلة...
          </p>
        </div>
      </div>

    </div>
  </main>

  <!-- BOTTOM SCRUBBER & AUDIO STATUS BAR -->
  <footer id="studioBottomBar" class="studio-fade w-full max-w-5xl z-50 flex flex-col gap-2 py-2 px-4 rounded-2xl glass-panel text-white text-xs mt-2 shadow-2xl">
    <div class="flex items-center gap-3">
      <span class="font-mono text-white/70 text-[11px]">00:00</span>
      <input type="range" id="timelineScrubber" min="0" max="160" step="0.05" value="0" class="flex-1 cursor-pointer" oninput="onScrub(this.value)">
      <span class="font-mono text-white/70 text-[11px]" id="totalDurationText">02:39</span>
    </div>

    <div class="flex items-center justify-between text-[11px] text-white/60">
      <div class="flex items-center gap-3">
        <span>اختصارات: <kbd class="px-1.5 py-0.5 bg-white/10 rounded font-mono text-[10px]">Space</kbd> تشغيل | <kbd class="px-1.5 py-0.5 bg-white/10 rounded font-mono text-[10px]">H</kbd> وضع نقي | <kbd class="px-1.5 py-0.5 bg-white/10 rounded font-mono text-[10px]">S</kbd> ترجمة | <kbd class="px-1.5 py-0.5 bg-white/10 rounded font-mono text-[10px]">1-6</kbd> مشاهد</span>
      </div>

      <div class="flex items-center gap-3">
        <!-- Audio Source Switcher / Uploader -->
        <label class="cursor-pointer text-white/80 hover:text-brand-coral flex items-center gap-1 transition">
          <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z"/></svg>
          <span>تغيير ملف الصوت</span>
          <input type="file" id="audioFileInput" accept="audio/*" class="hidden" onchange="loadCustomAudio(this)">
        </label>
        <span class="text-white/40">•</span>
        <span class="text-brand-coral font-eng font-bold">1080×1920 (9:16) @ 60FPS</span>
      </div>
    </div>
  </footer>

  <!-- NOTIFICATION TOAST -->
  <div id="toast" class="fixed top-6 right-6 z-50 bg-[#181816] border border-brand-coral/40 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 transition-all duration-300 transform translate-y-[-50px] opacity-0 pointer-events-none">
    <span class="text-brand-coral text-lg">✦</span>
    <span id="toastMessage" class="text-xs font-arabic font-medium">تمت العملية بنجاح</span>
  </div>

  <!-- Hidden Native Audio Player with Embedded Voiceover -->
  <audio id="mainAudio" preload="auto" playsinline crossorigin="anonymous"></audio>

  <!-- JAVASCRIPT LOGIC & MOTION ENGINE -->
  <script>
    // --- 1. EMBEDDED AUDIO SOURCE (Official Voiceover) ---
    const AUDIO_BASE64_DATA = "data:audio/mp3;base64,${audioBase64}";
    const audio = document.getElementById('mainAudio');
    audio.src = AUDIO_BASE64_DATA;

    // --- 2. TIMELINE SUBTITLES & SCENE DEFINITIONS ---
    const SUBTITLES = [
      { start: 0.0, end: 3.5, text: "عالم الذكاء الاصطناعي بيتحرك بسرعة مذهلة." },
      { start: 3.5, end: 7.0, text: "آلاف الأدوات ومئات الكورسات بتظهر كل يوم." },
      { start: 7.0, end: 11.0, text: "لكن وسط الزحام ده، المستخدم العربي دايماً بيواجه مشكلتين:" },
      { start: 11.0, end: 14.5, text: "التشتت بين مصادر مش عارف مدى جودتها،" },
      { start: 14.5, end: 19.5, text: "وغياب الأدوات المتخصصة اللي بتفهم طبيعة شغله وبتدعم لغته العربية صح." },
      
      { start: 19.5, end: 23.0, text: "عشان كده، تولزي النهارده بتبدأ فصل جديد كلياً." },
      { start: 23.0, end: 27.0, text: "سيبنا فكرة الموقع المتشعب اللي بيحاول يعمل كل حاجة في وقت واحد،" },
      { start: 27.0, end: 34.5, text: "وبنينا منظومة برمجية رشيقة ومتكاملة، قائمة على التركيز، السرعة، وتوجيه القوة في مكانها الصح،" },
      { start: 34.5, end: 37.0, text: "من خلال تلات ركائز أساسية." },
      
      { start: 37.0, end: 41.0, text: "الركيزة الأولى هي بوابتك الرئيسية: tolzy.me." },
      { start: 41.0, end: 45.0, text: "حولنا المنصة لأكبر وأسرع دليل استكشاف تقني في الوطن العربي،" },
      { start: 45.0, end: 50.0, text: "مقسم لمسارين واضحين في مكان واحد: دليل الأدوات، ودليل الكورسات." },
      { start: 50.0, end: 57.0, text: "على واجهة خفيفة بتفتح في أجزاء من الثانية، هتلاقي أكتر من 1000 أداة ذكاء اصطناعي،" },
      { start: 57.0, end: 62.0, text: "وأكتر من 150 كورس ومسار تعليمي مفتوح، مفهرسين ومصنفين بدقة." },
      { start: 62.0, end: 66.0, text: "ومش بس كده، بفضل الفلترة اللحظية وميزة المقارنة السريعة،" },
      { start: 66.0, end: 75.0, text: "تقدر تختار أداتين أو تلاتة، وتقارن بينهم فوراً في جدول واحد بيعرض السعر، المميزات، العيوب، ودعم العربية،" },
      { start: 75.0, end: 77.5, text: "عشان تاخد قرارك الصح في ثواني." },
      
      { start: 77.5, end: 81.0, text: "ومن الاستكشاف، بننتقل مباشرة للإنتاج،" },
      { start: 81.0, end: 85.0, text: "مع الركيزة التانية والمنتج الأقوى في المنظومة: TOLZY Flow." },
      { start: 85.0, end: 91.0, text: "المحرك العربي الرائد لأتمتة وصناعة مستندات الأوفيس الاحترافية القابلة للتعديل بالكامل." },
      { start: 91.0, end: 96.0, text: "بضغطة زر واحدة، تقدر تحول أفكارك أو حتى روابط الفيديوهات والمصادر،" },
      { start: 96.0, end: 99.0, text: "لعروض بوربوينت متناسقة وجاهزة للعرض،" },
      { start: 99.0, end: 106.0, text: "وتقارير وورد مهيأة بفهارسها وتنسيقاتها من اليمين لليسار بدون أي تشوه في النص العربي،" },
      { start: 106.0, end: 112.0, text: "وجداول إكسيل مالية وإدارية شغالة بمعادلات حسابية حقيقية وتنسيق ذكي." },
      { start: 112.0, end: 116.0, text: "وكل القوة دي بتشتغل في الخلفية بمحركنا الخاص: AXIOM." },
      { start: 116.0, end: 122.0, text: "العقل المدبر والنواة الذكية اللي بتدير المنطق البرمجي داخل TOLZY Flow بأعلى دقة وكفاءة." },
      
      { start: 122.0, end: 129.0, text: "أما الركيزة التالتة، فهي مساحة الابتكار العميق: معمل أبحاث TOLZY Agri Lab." },
      { start: 129.0, end: 138.0, text: "معمل أكاديمي وتطبيقي مغلق، مخصص للأبحاث في دمج الرؤية الحاسوبية والذكاء الاصطناعي في القطاع الزراعي والداجني،" },
      { start: 138.0, end: 144.0, text: "عشان يخرج للنور كحل عيني متكامل، مبني على أبحاث وأوراق علمية موثقة." },
      
      { start: 144.0, end: 149.0, text: "تولزي النهارده بتتطور عشان تكون أكتر رشاقة، أسرع، وأقوى." },
      { start: 149.0, end: 155.0, text: "بوابة استكشاف وتعلم هي الأسرع، ومحرك إنتاجية عربي بينافس عالمياً." },
      { start: 155.0, end: 160.0, text: "تولزي.. القادم أذكى، أسرع، ومصنوع ليخدمك." }
    ];

    const SCENES = [
      { id: 1, name: "المشهد ١: الزحام والمشكلتان", start: 0.0, end: 19.5, accent: '#D97757' },
      { id: 2, name: "المشهد ٢: التحول وركائز المنظومة", start: 19.5, end: 37.0, accent: '#D97757' },
      { id: 3, name: "المشهد ٣: tolzy.me والمقارنة", start: 37.0, end: 77.5, accent: '#4285F4' },
      { id: 4, name: "المشهد ٤: TOLZY Flow & AXIOM", start: 77.5, end: 122.0, accent: '#D97757' },
      { id: 5, name: "المشهد ٥: TOLZY Agri Lab", start: 122.0, end: 144.0, accent: '#2E8B57' },
      { id: 6, name: "المشهد ٦: الخاتمة والعهد الجديد", start: 144.0, end: 160.0, accent: '#D97757' }
    ];

    // --- 3. CANVAS STAGE SETUP & 60FPS ENGINE ---
    const canvas = document.getElementById('stageCanvas');
    const ctx = canvas.getContext('2d');
    const CW = 1080;
    const CH = 1920;

    let showSubtitles = true;
    let isCleanMode = false;
    let isExporting = false;
    let mediaRecorder = null;
    let recordedBlobs = [];
    let audioCtx = null;
    let audioSourceNode = null;
    let audioDestNode = null;

    // Easing functions
    function easeOutCubic(t) { return 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 3); }
    function easeOutBack(t) {
      const c1 = 1.70158;
      const c3 = c1 + 1;
      const clamped = Math.max(0, Math.min(1, t));
      return 1 + c3 * Math.pow(clamped - 1, 3) + c1 * Math.pow(clamped - 1, 2);
    }
    function clamp(val, min, max) { return Math.max(min, Math.min(max, val)); }

    // Helper: Rounded Rectangle
    function drawRoundRect(c, x, y, w, h, r, fill, stroke, strokeW = 1) {
      c.save();
      c.beginPath();
      if (c.roundRect) {
        c.roundRect(x, y, w, h, r);
      } else {
        c.moveTo(x + r, y);
        c.arcTo(x + w, y, x + w, y + h, r);
        c.arcTo(x + w, y + h, x, y + h, r);
        c.arcTo(x, y + h, x, y, r);
        c.arcTo(x, y, x + w, y, r);
      }
      c.closePath();
      if (fill) {
        c.fillStyle = fill;
        c.fill();
      }
      if (stroke) {
        c.strokeStyle = stroke;
        c.lineWidth = strokeW;
        c.stroke();
      }
      c.restore();
    }

    // Dot grid drawing
    function drawDotGrid(c, time) {
      const spacing = 48;
      c.fillStyle = 'rgba(24, 24, 22, 0.04)';
      for (let x = spacing / 2; x < CW; x += spacing) {
        for (let y = spacing / 2; y < CH; y += spacing) {
          c.beginPath();
          c.arc(x, y, 1.8, 0, Math.PI * 2);
          c.fill();
        }
      }
    }

    // Dynamic Ambient Glow
    function drawAmbientGlow(c, time, sceneAccent) {
      c.save();
      const wave1 = Math.sin(time * 0.8) * 80;
      const wave2 = Math.cos(time * 0.6) * 60;
      
      const grad1 = c.createRadialGradient(CW * 0.3 + wave1, 400 + wave2, 20, CW * 0.3 + wave1, 400 + wave2, 480);
      grad1.addColorStop(0, sceneAccent + '22');
      grad1.addColorStop(1, 'rgba(250, 248, 245, 0)');
      c.fillStyle = grad1;
      c.fillRect(0, 0, CW, CH);

      const grad2 = c.createRadialGradient(CW * 0.7 - wave2, 1300 + wave1, 20, CW * 0.7 - wave2, 1300 + wave1, 520);
      grad2.addColorStop(0, (sceneAccent === '#D97757' ? '#4285F4' : '#D97757') + '15');
      grad2.addColorStop(1, 'rgba(250, 248, 245, 0)');
      c.fillStyle = grad2;
      c.fillRect(0, 0, CW, CH);
      c.restore();
    }

    // Status bar & home indicator
    function drawPhoneStatusBar(c) {
      c.save();
      c.font = '700 24px "Plus Jakarta Sans", sans-serif';
      c.fillStyle = '#181816';
      c.textAlign = 'left';
      c.fillText('9:41', 84, 80);

      c.textAlign = 'right';
      c.font = '600 20px "Plus Jakarta Sans", sans-serif';
      c.fillText('5G  100%', CW - 84, 80);
      c.restore();
    }

    function drawHomeIndicator(c) {
      c.save();
      drawRoundRect(c, CW / 2 - 140, CH - 42, 280, 8, 4, 'rgba(24, 24, 22, 0.25)');
      c.restore();
    }

    // --- SCENE 1 RENDERER: The AI Noise & The 2 Arabic Problems ---
    function renderScene1(c, t, p) {
      c.direction = 'rtl';
      // 1. Floating chaotic mini-pills (Top Zone Y: 220-440)
      const pills = [
        { text: "+10,000 AI Tools?", x: 260, y: 220, rot: -0.06, color: "#E05252" },
        { text: "RTL Error: ةيبرعلا ⚠️", x: 740, y: 240, rot: 0.05, color: "#D49A38" },
        { text: "English-Only UI & Scattered", x: 380, y: 310, rot: 0.03, color: "#716F68" },
        { text: "تشتت واشتراكات مهدورة", x: 780, y: 330, rot: -0.04, color: "#E05252" }
      ];

      pills.forEach((pill, idx) => {
        const floatY = Math.sin(t * 2 + idx) * 12;
        const enterDelay = idx * 0.12;
        const enterP = easeOutBack(clamp((p - enterDelay) * 3, 0, 1));
        c.save();
        c.translate(pill.x, pill.y + floatY);
        c.rotate(pill.rot);
        c.scale(enterP, enterP);
        
        drawRoundRect(c, -170, -28, 340, 56, 28, 'rgba(255, 255, 255, 0.95)', 'rgba(24, 24, 22, 0.12)', 2);
        
        c.font = '700 22px "Plus Jakarta Sans", "IBM Plex Sans Arabic", sans-serif';
        c.fillStyle = pill.color;
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        c.fillText(pill.text, 0, 2);
        c.restore();
      });

      // 2. Hero Headline (Center Y: 440-660)
      const titleP = easeOutCubic(clamp(p * 2.5, 0, 1));
      c.save();
      c.translate(CW / 2, 480 + (1 - titleP) * 50);
      c.globalAlpha = titleP;

      // Small category badge
      drawRoundRect(c, -180, -70, 360, 44, 22, '#181816', null);
      c.font = '700 18px "Plus Jakarta Sans", "IBM Plex Sans Arabic", sans-serif';
      c.fillStyle = '#FAF8F5';
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText('الواقع الحالي للذكاء الاصطناعي', 0, -48);

      // Big punchy headline
      c.font = '700 56px "IBM Plex Sans Arabic", sans-serif';
      c.fillStyle = '#181816';
      c.fillText('آلاف الأدوات كل يوم..', 0, 10);
      c.fillStyle = '#D97757';
      c.fillText('وتشتت أكبر للمستخدم', 0, 80);

      // Editorial serif accent
      c.font = 'italic 34px "Instrument Serif", Georgia, serif';
      c.fillStyle = '#716F68';
      c.fillText('Too much noise. Broken context.', 0, 136);
      c.restore();

      // 3. Bottom Vertical Stack (2 Stacked Bento Cards Y: 720-1460)
      // Card 1: التشتت
      const card1P = easeOutCubic(clamp((t - 7.5) * 1.5, 0, 1));
      if (card1P > 0) {
        c.save();
        c.translate(CW / 2, 730 + (1 - card1P) * 100);
        c.globalAlpha = card1P;
        
        drawRoundRect(c, -450, 0, 900, 310, 32, '#FFFFFF', 'rgba(24, 24, 22, 0.08)', 2);
        
        c.fillStyle = '#E05252';
        drawRoundRect(c, -410, 35, 120, 38, 19, 'rgba(224, 82, 82, 0.12)', null);
        c.font = '800 18px "Plus Jakarta Sans", sans-serif';
        c.textAlign = 'center';
        c.fillText('المشكلة 01', -350, 60);

        c.font = '700 36px "IBM Plex Sans Arabic", sans-serif';
        c.fillStyle = '#181816';
        c.textAlign = 'right';
        c.fillText('١. التشتت وسط الزحام', 410, 64);

        c.font = '500 24px "IBM Plex Sans Arabic", sans-serif';
        c.fillStyle = '#5A5852';
        c.fillText('عشرات المواقع ومصادر غير معلومة الجودة، ومئات الاشتراكات', 410, 130);
        c.fillText('الشهرية بدون فائدة ملموسة لطبيعة عملك الحقيقية.', 410, 175);

        drawRoundRect(c, -410, 225, 820, 48, 24, '#FAF8F5', 'rgba(24, 24, 22, 0.06)', 1);
        drawRoundRect(c, -410, 225, 620, 48, 24, 'rgba(224, 82, 82, 0.2)', null);
        c.font = '700 18px "IBM Plex Sans Arabic", sans-serif';
        c.fillStyle = '#E05252';
        c.textAlign = 'right';
        c.fillText('⚠️ هدر وقت المستخدم والبحث العشوائي: ٨٥٪', 390, 256);
        c.restore();
      }

      // Card 2: غياب التخصص ودعم العربية
      const card2P = easeOutCubic(clamp((t - 13.5) * 1.5, 0, 1));
      if (card2P > 0) {
        c.save();
        c.translate(CW / 2, 1080 + (1 - card2P) * 100);
        c.globalAlpha = card2P;
        
        drawRoundRect(c, -450, 0, 900, 310, 32, '#FFFFFF', 'rgba(217, 119, 87, 0.25)', 2);
        
        drawRoundRect(c, -410, 35, 120, 38, 19, 'rgba(217, 119, 87, 0.15)', null);
        c.font = '800 18px "Plus Jakarta Sans", sans-serif';
        c.fillStyle = '#D97757';
        c.textAlign = 'center';
        c.fillText('المشكلة 02', -350, 60);

        c.font = '700 36px "IBM Plex Sans Arabic", sans-serif';
        c.fillStyle = '#181816';
        c.textAlign = 'right';
        c.fillText('٢. غياب التخصص ودعم العربية', 410, 64);

        c.font = '500 24px "IBM Plex Sans Arabic", sans-serif';
        c.fillStyle = '#5A5852';
        c.fillText('أدوات لا تفهم لغة وسياق أعمالنا، وتشوّه متكرر ومستفز', 410, 130);
        c.fillText('في خطوط اليمين لليسار (RTL) وعدم ملائمة لبيئة العمل المحلية.', 410, 175);

        const tags = ['تنسيق مكسور ⚠️', 'عزل المحتوى العربي', 'غياب الأتمتة الموثوقة'];
        tags.forEach((tag, idx) => {
          const tx = 250 - idx * 260;
          drawRoundRect(c, tx - 110, 225, 230, 48, 24, '#FAF8F5', 'rgba(24, 24, 22, 0.08)', 1);
          c.font = '600 18px "IBM Plex Sans Arabic", sans-serif';
          c.fillStyle = '#181816';
          c.textAlign = 'center';
          c.fillText(tag, tx + 5, 255);
        });
        c.restore();
      }
    }

    // --- SCENE 2 RENDERER: The Shift — 3 Vertical Pillars Stack ---
    function renderScene2(c, t, p) {
      c.direction = 'rtl';
      // 1. Top Brand Logo & Badge (Y: 180-450)
      const topP = easeOutBack(clamp(p * 2, 0, 1));
      c.save();
      c.translate(CW / 2, 260);
      c.scale(topP, topP);

      drawRoundRect(c, -50, -90, 100, 100, 30, '#181816', null);
      c.font = '800 48px "Plus Jakarta Sans", sans-serif';
      c.fillStyle = '#D97757';
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText('T', 0, -40);

      c.font = '800 62px "Plus Jakarta Sans", sans-serif';
      c.fillStyle = '#181816';
      c.fillText('TOLZY', 0, 60);

      drawRoundRect(c, -160, 95, 320, 44, 22, 'rgba(217, 119, 87, 0.15)', 'rgba(217, 119, 87, 0.4)', 1.5);
      c.font = '700 20px "IBM Plex Sans Arabic", sans-serif';
      c.fillStyle = '#D97757';
      c.fillText('فصل جديد كلياً • A New Era', 0, 118);

      c.font = '500 24px "IBM Plex Sans Arabic", sans-serif';
      c.fillStyle = '#716F68';
      c.fillText('منظومة برمجية رشيقة قائمة على التركيز والسرعة الفائقة', 0, 175);
      c.restore();

      // 2. Central Vertical Glowing Timeline Conduit (Y: 480-1480)
      c.save();
      const conduitX = CW / 2 - 400;
      c.strokeStyle = 'rgba(24, 24, 22, 0.1)';
      c.lineWidth = 4;
      c.beginPath();
      c.moveTo(conduitX, 520);
      c.lineTo(conduitX, 1500);
      c.stroke();

      const pulseY = 520 + ((t * 180) % 980);
      const gradPulse = c.createLinearGradient(conduitX, pulseY - 80, conduitX, pulseY + 80);
      gradPulse.addColorStop(0, 'rgba(217, 119, 87, 0)');
      gradPulse.addColorStop(0.5, '#D97757');
      gradPulse.addColorStop(1, 'rgba(217, 119, 87, 0)');
      c.strokeStyle = gradPulse;
      c.lineWidth = 8;
      c.beginPath();
      c.moveTo(conduitX, pulseY - 80);
      c.lineTo(conduitX, pulseY + 80);
      c.stroke();
      c.restore();

      // 3. Three Connected Bento Cards Stacked Vertically
      const pillars = [
        {
          num: "01",
          name: "tolzy.me",
          sub: "بوابة الاستكشاف والتعلم التقني الأسرع",
          metrics: "+1000 أداة ذكاء اصطناعي | +150 كورس ومسار",
          color: "#4285F4",
          delay: 0.1,
          y: 530,
          highlight: false
        },
        {
          num: "02",
          name: "TOLZY Flow",
          sub: "محرك مستندات الأوفيس الذكي بالعربية",
          metrics: "Powered by AXIOM V2 • بوربوينت | وورد | إكسيل",
          color: "#D97757",
          delay: 0.35,
          y: 850,
          highlight: true
        },
        {
          num: "03",
          name: "TOLZY Agri Lab",
          sub: "معمل الأبحاث والتطوير الأكاديمي المغلق",
          metrics: "Computer Vision & Deep R&D في القطاع الزراعي والداجني",
          color: "#2E8B57",
          delay: 0.6,
          y: 1170,
          highlight: false
        }
      ];

      pillars.forEach(pil => {
        const pilP = easeOutBack(clamp((p - pil.delay) * 2.8, 0, 1));
        if (pilP <= 0) return;

        c.save();
        c.translate(CW / 2 + 30, pil.y);
        c.scale(pilP, pilP);

        if (pil.highlight) {
          c.shadowColor = 'rgba(217, 119, 87, 0.25)';
          c.shadowBlur = 35;
        }

        drawRoundRect(c, -380, 0, 780, 270, 32, '#FFFFFF', pil.highlight ? pil.color : 'rgba(24, 24, 22, 0.08)', pil.highlight ? 3 : 1.5);
        c.shadowBlur = 0;

        drawRoundRect(c, 260, 30, 90, 40, 20, pil.color + '18', null);
        c.font = '800 20px "Plus Jakarta Sans", sans-serif';
        c.fillStyle = pil.color;
        c.textAlign = 'center';
        c.fillText(pil.num, 305, 57);

        c.font = '800 38px "Plus Jakarta Sans", "IBM Plex Sans Arabic", sans-serif';
        c.fillStyle = '#181816';
        c.textAlign = 'right';
        c.fillText(pil.name, 240, 62);

        c.font = '600 24px "IBM Plex Sans Arabic", sans-serif';
        c.fillStyle = '#4A4843';
        c.fillText(pil.sub, 350, 126);

        drawRoundRect(c, -340, 165, 690, 64, 20, '#FAF8F5', 'rgba(24, 24, 22, 0.06)', 1);
        c.font = '700 20px "IBM Plex Sans Arabic", "Plus Jakarta Sans", sans-serif';
        c.fillStyle = pil.color;
        c.textAlign = 'right';
        c.fillText('✦ ' + pil.metrics, 320, 204);

        c.restore();
        c.save();
        c.translate(conduitX, pil.y + 135);
        c.beginPath();
        c.arc(0, 0, 14, 0, Math.PI * 2);
        c.fillStyle = pil.color;
        c.fill();
        c.strokeStyle = '#FFFFFF';
        c.lineWidth = 4;
        c.stroke();
        c.restore();
      });
    }

    // --- SCENE 3 RENDERER: Pillar 1 — tolzy.me Mobile UI & Quick Compare ---
    function renderScene3(c, t, p) {
      c.direction = 'rtl';
      // 1. Mobile Browser Top Bar (Y: 180-480)
      const topP = easeOutCubic(clamp(p * 3, 0, 1));
      c.save();
      c.translate(CW / 2, 200 + (1 - topP) * 40);
      c.globalAlpha = topP;

      drawRoundRect(c, -450, 0, 900, 84, 24, '#FFFFFF', 'rgba(24, 24, 22, 0.1)', 1.5);
      
      c.font = '700 26px "Plus Jakarta Sans", sans-serif';
      c.fillStyle = '#4285F4';
      c.textAlign = 'left';
      c.fillText('🔒 tolzy.me', -410, 52);

      drawRoundRect(c, 180, 18, 230, 48, 24, 'rgba(66, 133, 244, 0.12)', null);
      c.font = '700 20px "IBM Plex Sans Arabic", "Plus Jakarta Sans", sans-serif';
      c.fillStyle = '#4285F4';
      c.textAlign = 'center';
      c.fillText('⚡ سرعة فائقة 0.1s', 295, 49);

      drawRoundRect(c, -450, 105, 900, 76, 26, '#EDE9E2', null);
      
      const toggleP = clamp((t - 44.0) * 0.8, 0, 1);
      const pillX = -445 + (1 - toggleP) * 440;
      drawRoundRect(c, pillX, 110, 440, 66, 22, '#FFFFFF', null);

      c.font = '700 24px "IBM Plex Sans Arabic", sans-serif';
      c.textAlign = 'center';
      c.fillStyle = '#181816';
      c.fillText('دليل الأدوات (+1000 أداة)', -225, 152);
      c.fillStyle = '#716F68';
      c.fillText('دليل الكورسات (+150 مسار)', 225, 152);

      const chips = [
        { label: '✓ يدعم العربية 100%', active: true },
        { label: 'مجاني بالكامل', active: true },
        { label: 'فلترة لحظية وفورية', active: false },
        { label: 'أعلى تقييم', active: false }
      ];
      let cx = 430;
      chips.forEach(chip => {
        const chipW = chip.label.length * 15 + 40;
        cx -= chipW;
        drawRoundRect(c, cx, 200, chipW, 52, 26, chip.active ? '#4285F4' : '#FFFFFF', chip.active ? null : 'rgba(24, 24, 22, 0.1)', 1);
        c.font = '600 20px "IBM Plex Sans Arabic", sans-serif';
        c.fillStyle = chip.active ? '#FFFFFF' : '#181816';
        c.textAlign = 'center';
        c.fillText(chip.label, cx + chipW / 2, 233);
        cx -= 15;
      });
      c.restore();

      // 2. Mobile Quick Compare Matrix (Center Y: 510-1260)
      const matrixP = easeOutBack(clamp((t - 55.0) * 1.5, 0, 1));
      if (matrixP > 0) {
        c.save();
        c.translate(CW / 2, 530 + (1 - matrixP) * 60);
        c.scale(matrixP, matrixP);

        drawRoundRect(c, -450, 0, 900, 680, 34, '#FFFFFF', 'rgba(66, 133, 244, 0.25)', 2);

        c.font = '700 32px "IBM Plex Sans Arabic", sans-serif';
        c.fillStyle = '#181816';
        c.textAlign = 'right';
        c.fillText('مقارنة سريعة بجدول واحد', 410, 60);

        c.font = '500 20px "IBM Plex Sans Arabic", sans-serif';
        c.fillStyle = '#716F68';
        c.fillText('اختر أداتين أو ثلاثة وقارن السعر والمميزات ودعم العربية بلحظة', 410, 100);

        const colW = 260;
        const col1X = -390;
        const col2X = -110;
        const col3X = 170;

        drawRoundRect(c, col3X - 10, 130, colW + 20, 520, 24, 'rgba(66, 133, 244, 0.08)', '#4285F4', 2);
        drawRoundRect(c, col3X + 20, 115, colW - 40, 36, 18, '#4285F4', null);
        c.font = '800 16px "Plus Jakarta Sans", sans-serif';
        c.fillStyle = '#FFFFFF';
        c.textAlign = 'center';
        c.fillText('★ TOLZY PICK', col3X + colW / 2, 138);

        c.font = '700 24px "Plus Jakarta Sans", sans-serif';
        c.fillStyle = '#716F68';
        c.fillText('Tool A', col1X + colW / 2, 175);
        c.fillText('Tool B', col2X + colW / 2, 175);
        c.fillStyle = '#4285F4';
        c.fillText('الأداة المختارة', col3X + colW / 2, 175);

        const rows = [
          { label: "السعر", a: "$49 / شهر", b: "$29 / شهر", pick: "مجاني / Freemium" },
          { label: "دعم العربية", a: "❌ مشوّه تماماً", b: "⚠️ ترجمة ركيكة", pick: "✅ 100% RTL أصيل" },
          { label: "المميزات", a: "عامة ومشتتة", b: "إنجليزية فقط", pick: "مصممة للواقع العربي" },
          { label: "التقييم", a: "3.2 / 5", b: "3.9 / 5", pick: "4.9 / 5 ★★★★★" }
        ];

        rows.forEach((row, idx) => {
          const ry = 220 + idx * 105;
          c.strokeStyle = 'rgba(24, 24, 22, 0.06)';
          c.lineWidth = 1;
          c.beginPath();
          c.moveTo(-410, ry);
          c.lineTo(410, ry);
          c.stroke();

          c.font = '700 18px "IBM Plex Sans Arabic", sans-serif';
          c.fillStyle = '#716F68';
          c.textAlign = 'center';
          c.fillText(row.label, -360, ry + 30);

          c.font = '600 20px "IBM Plex Sans Arabic", "Plus Jakarta Sans", sans-serif';
          c.fillStyle = '#5A5852';
          c.fillText(row.a, col1X + colW / 2, ry + 65);
          c.fillText(row.b, col2X + colW / 2, ry + 65);

          c.font = '700 21px "IBM Plex Sans Arabic", "Plus Jakarta Sans", sans-serif';
          c.fillStyle = '#4285F4';
          c.fillText(row.pick, col3X + colW / 2, ry + 65);
        });
        c.restore();
      }

      // 3. Bottom Sticky Bento CTA (Y: 1300-1540)
      const ctaP = easeOutBack(clamp((t - 68.0) * 1.5, 0, 1));
      if (ctaP > 0) {
        c.save();
        c.translate(CW / 2, 1310 + (1 - ctaP) * 50);
        c.globalAlpha = ctaP;

        c.shadowColor = 'rgba(217, 119, 87, 0.35)';
        c.shadowBlur = 25;
        drawRoundRect(c, -450, 0, 900, 180, 32, '#D97757', null);
        drawRoundRect(c, -450, 0, 900, 180, 32, null, '#FFFFFF', 2);
        c.shadowBlur = 0;

        c.fillStyle = '#FFFFFF';
        c.font = '700 34px "IBM Plex Sans Arabic", sans-serif';
        c.textAlign = 'right';
        c.fillText('ولّد ملفات أوفيس بالعربي فوراً', 400, 70);

        c.font = '500 22px "IBM Plex Sans Arabic", sans-serif';
        c.fillStyle = 'rgba(255, 255, 255, 0.9)';
        c.fillText('انتقل من مرحلة البحث والاستكشاف إلى الإنتاج المباشر', 400, 120);

        drawRoundRect(c, -400, 45, 220, 90, 24, '#FFFFFF', null);
        c.font = '800 22px "IBM Plex Sans Arabic", sans-serif';
        c.fillStyle = '#D97757';
        c.textAlign = 'center';
        c.fillText('جرب Flow ←', -290, 98);
        c.restore();
      }
    }

    // --- SCENE 4 RENDERER: Pillar 2 — TOLZY Flow & AXIOM V2 Pipeline ---
    function renderScene4(c, t, p) {
      c.direction = 'rtl';
      // 1. Top Input Node (Y: 180-410)
      const inputP = easeOutCubic(clamp(p * 3, 0, 1));
      c.save();
      c.translate(CW / 2, 200 + (1 - inputP) * 40);
      c.globalAlpha = inputP;

      drawRoundRect(c, -450, 0, 900, 190, 32, '#FFFFFF', 'rgba(24, 24, 22, 0.1)', 1.5);
      
      drawRoundRect(c, 240, 25, 170, 36, 18, 'rgba(217, 119, 87, 0.12)', null);
      c.font = '700 18px "IBM Plex Sans Arabic", sans-serif';
      c.fillStyle = '#D97757';
      c.textAlign = 'center';
      c.fillText('المدخلات الذكية', 325, 49);

      c.font = '700 30px "IBM Plex Sans Arabic", sans-serif';
      c.fillStyle = '#181816';
      c.textAlign = 'right';
      c.fillText('حول الفكرة أو روابط الفيديو والمصادر...', 410, 105);

      drawRoundRect(c, -410, 115, 440, 48, 24, '#FAF8F5', 'rgba(24, 24, 22, 0.08)', 1);
      c.font = '600 18px "Plus Jakarta Sans", sans-serif';
      c.fillStyle = '#716F68';
      c.textAlign = 'left';
      c.fillText('🔗 youtube.com/watch?v=... / فكرة', -390, 146);

      drawRoundRect(c, 70, 115, 340, 48, 24, 'rgba(217, 119, 87, 0.15)', null);
      c.font = '700 18px "IBM Plex Sans Arabic", sans-serif';
      c.fillStyle = '#D97757';
      c.textAlign = 'center';
      c.fillText('⚡ بضغطة زر واحدة فقط', 240, 146);
      c.restore();

      // 2. Center Processor: AXIOM V2 Core Engine (Y: 430-850)
      const coreP = easeOutBack(clamp((t - 82.0) * 1.5, 0, 1));
      if (coreP > 0) {
        c.save();
        c.translate(CW / 2, 450);
        c.scale(coreP, coreP);

        const pulse = Math.sin(t * 4) * 0.15 + 0.85;
        c.shadowColor = 'rgba(217, 119, 87, 0.5)';
        c.shadowBlur = 40 * pulse;

        drawRoundRect(c, -450, 0, 900, 340, 36, '#181816', '#D97757', 3);
        c.shadowBlur = 0;

        drawRoundRect(c, -160, 30, 320, 46, 23, 'rgba(217, 119, 87, 0.25)', 'rgba(217, 119, 87, 0.5)', 1);
        c.font = '800 22px "Plus Jakarta Sans", sans-serif';
        c.fillStyle = '#D97757';
        c.textAlign = 'center';
        c.fillText('AXIOM V2 ENGINE', 0, 60);

        c.font = '800 44px "IBM Plex Sans Arabic", sans-serif';
        c.fillStyle = '#FAF8F5';
        c.fillText('العقل المدبر والنواة الذكية', 0, 140);

        c.font = '500 24px "IBM Plex Sans Arabic", sans-serif';
        c.fillStyle = '#A39F95';
        c.fillText('إدارة المنطق البرمجي داخل TOLZY Flow بأعلى دقة وكفاءة', 0, 195);

        const streamProgress = (t * 2.5) % 1;
        for (let i = -3; i <= 3; i++) {
          const sx = i * 110;
          const sy = 250 + streamProgress * 70;
          c.beginPath();
          c.arc(sx, sy, 5, 0, Math.PI * 2);
          c.fillStyle = '#D97757';
          c.fill();
        }

        drawRoundRect(c, -400, 250, 800, 56, 28, 'rgba(255, 255, 255, 0.06)', null);
        c.font = '700 20px "Plus Jakarta Sans", "IBM Plex Sans Arabic", sans-serif';
        c.fillStyle = '#D97757';
        c.textAlign = 'center';
        c.fillText('⚡ 100% Native RTL Layout Processing • Real-time Office Synthesizer', 0, 285);
        c.restore();
      }

      // 3. Bottom 3 Stacked Office Output Cards (Y: 860-1560)
      const outputs = [
        {
          ext: "PPTX",
          name: "عروض بوربوينت متناسقة وجاهزة للعرض",
          desc: "سلايدات مصممة باحتراف، جاهزة للتقديم المباشر، وتدفق نصي أصيل من اليمين لليسار.",
          tag: "100% RTL Native • قابل للتعديل بالكامل",
          color: "#D97757",
          iconBg: "#FFEFE8",
          delay: 88.0,
          y: 870
        },
        {
          ext: "DOCX",
          name: "تقارير وورد مهيأة بفهارس وتنسيق متقن",
          desc: "فهرسة تلقائية، ترقيم منظم، بدون أي تشوه أو انعكاس في الكلمات والجمل العربية.",
          tag: "فهارس وجداول محتويات ذكية",
          color: "#4285F4",
          iconBg: "#EBF3FE",
          delay: 96.0,
          y: 1100
        },
        {
          ext: "XLSX",
          name: "جداول إكسيل مالية وإدارية بمعادلات نشطة",
          desc: "دوال حسابية حقيقية =SUM() ومعادلات مالية حية مع تصميم وتنسيق شرطي ذكي.",
          tag: "معادلات وصيغ حية نشطة",
          color: "#2E8B57",
          iconBg: "#EAF5EE",
          delay: 104.0,
          y: 1330
        }
      ];

      outputs.forEach(out => {
        const outP = easeOutBack(clamp((t - out.delay) * 1.5, 0, 1));
        if (outP <= 0) return;

        c.save();
        c.translate(CW / 2, out.y);
        c.scale(outP, outP);

        drawRoundRect(c, -450, 0, 900, 205, 30, '#FFFFFF', 'rgba(24, 24, 22, 0.08)', 1.5);

        drawRoundRect(c, 290, 30, 130, 145, 22, out.iconBg, out.color + '30', 2);
        c.font = '800 32px "Plus Jakarta Sans", sans-serif';
        c.fillStyle = out.color;
        c.textAlign = 'center';
        c.fillText(out.ext, 355, 95);
        c.font = '700 16px "Plus Jakarta Sans", sans-serif';
        c.fillText('OFFICE', 355, 130);

        c.font = '700 30px "IBM Plex Sans Arabic", sans-serif';
        c.fillStyle = '#181816';
        c.textAlign = 'right';
        c.fillText(out.name, 260, 68);

        c.font = '500 20px "IBM Plex Sans Arabic", sans-serif';
        c.fillStyle = '#5A5852';
        c.fillText(out.desc, 260, 114);

        drawRoundRect(c, -410, 138, 380, 42, 21, out.color + '15', null);
        c.font = '700 17px "IBM Plex Sans Arabic", sans-serif';
        c.fillStyle = out.color;
        c.textAlign = 'center';
        c.fillText('✓ ' + out.tag, -220, 164);
        c.restore();
      });
    }

    // --- SCENE 5 RENDERER: Pillar 3 — TOLZY Agri Lab Mobile HUD ---
    function renderScene5(c, t, p) {
      c.direction = 'rtl';
      // 1. Top Architectural Lab Badge (Y: 180-330)
      const topP = easeOutBack(clamp(p * 2.5, 0, 1));
      c.save();
      c.translate(CW / 2, 200);
      c.scale(topP, topP);

      drawRoundRect(c, -450, 0, 900, 100, 24, '#FFFFFF', '#2E8B57', 2);
      
      const blink = Math.sin(t * 6) > 0 ? 1 : 0.4;
      c.beginPath();
      c.arc(-390, 50, 10, 0, Math.PI * 2);
      c.fillStyle = \`rgba(46, 139, 87, \${blink})\`;
      c.fill();

      c.font = '800 22px "Plus Jakarta Sans", monospace';
      c.fillStyle = '#2E8B57';
      c.textAlign = 'left';
      c.fillText('CLOSED R&D LAB • agri.tolzy.me', -365, 58);

      c.font = '700 20px "IBM Plex Sans Arabic", sans-serif';
      c.fillStyle = '#181816';
      c.textAlign = 'right';
      c.fillText('معمل أبحاث تولزي الأكاديمي', 410, 58);
      c.restore();

      // 2. Center: Computer Vision Analytical Scanner HUD (Y: 340-1200)
      const hudP = easeOutCubic(clamp((t - 124.0) * 1.5, 0, 1));
      if (hudP > 0) {
        c.save();
        c.translate(CW / 2, 340);
        c.scale(hudP, hudP);

        drawRoundRect(c, -450, 0, 900, 840, 36, '#0B130E', '#2E8B57', 2);

        c.strokeStyle = 'rgba(46, 139, 87, 0.15)';
        c.lineWidth = 1;
        for (let gx = -400; gx <= 400; gx += 80) {
          c.beginPath(); c.moveTo(gx, 40); c.lineTo(gx, 800); c.stroke();
        }
        for (let gy = 80; gy <= 800; gy += 80) {
          c.beginPath(); c.moveTo(-410, gy); c.lineTo(410, gy); c.stroke();
        }

        const laserY = 80 + ((t * 220) % 680);
        const gradLaser = c.createLinearGradient(0, laserY - 40, 0, laserY + 40);
        gradLaser.addColorStop(0, 'rgba(46, 139, 87, 0)');
        gradLaser.addColorStop(0.5, 'rgba(46, 139, 87, 0.9)');
        gradLaser.addColorStop(1, 'rgba(46, 139, 87, 0)');
        c.fillStyle = gradLaser;
        c.fillRect(-440, laserY - 30, 880, 60);

        c.strokeStyle = '#38EF7D';
        c.lineWidth = 3;
        c.beginPath();
        c.moveTo(-440, laserY);
        c.lineTo(440, laserY);
        c.stroke();

        const b1P = clamp((t - 127.0) * 2, 0, 1);
        if (b1P > 0) {
          const b1X = -360, b1Y = 160, b1W = 420, b1H = 260;
          c.strokeStyle = '#38EF7D';
          c.lineWidth = 2;
          c.strokeRect(b1X, b1Y, b1W, b1H);

          c.lineWidth = 5;
          const retL = 20;
          c.beginPath();
          c.moveTo(b1X, b1Y + retL); c.lineTo(b1X, b1Y); c.lineTo(b1X + retL, b1Y);
          c.moveTo(b1X + b1W - retL, b1Y + b1H); c.lineTo(b1X + b1W, b1Y + b1H); c.lineTo(b1X + b1W, b1Y + b1H - retL);
          c.stroke();

          drawRoundRect(c, b1X, b1Y - 36, 320, 36, 10, '#38EF7D', null);
          c.font = '800 16px "Plus Jakarta Sans", monospace';
          c.fillStyle = '#0B130E';
          c.textAlign = 'left';
          c.fillText('CV: CROP HEALTH [98.4%]', b1X + 15, b1Y - 12);
        }

        const b2P = clamp((t - 132.0) * 2, 0, 1);
        if (b2P > 0) {
          const b2X = 30, b2Y = 460, b2W = 380, b2H = 240;
          c.strokeStyle = '#4285F4';
          c.lineWidth = 2;
          c.strokeRect(b2X, b2Y, b2W, b2H);

          c.lineWidth = 5;
          const retL = 20;
          c.beginPath();
          c.moveTo(b2X, b2Y + retL); c.lineTo(b2X, b2Y); c.lineTo(b2X + retL, b2Y);
          c.moveTo(b2X + b2W - retL, b2Y + b2H); c.lineTo(b2X + b2W, b2Y + b2H); c.lineTo(b2X + b2W, b2Y + b2H - retL);
          c.stroke();

          drawRoundRect(c, b2X, b2Y - 36, 340, 36, 10, '#4285F4', null);
          c.font = '800 16px "Plus Jakarta Sans", monospace';
          c.fillStyle = '#FFFFFF';
          c.textAlign = 'left';
          c.fillText('CV: POULTRY ACTIVITY [OPTIMAL]', b2X + 15, b2Y - 12);
        }

        drawRoundRect(c, -410, 730, 820, 80, 20, 'rgba(255, 255, 255, 0.05)', null);
        c.font = '700 18px "Plus Jakarta Sans", "IBM Plex Sans Arabic", sans-serif';
        c.fillStyle = '#38EF7D';
        c.textAlign = 'left';
        c.fillText('SPECTRUM: 0.84 NDVI', -380, 775);
        c.fillStyle = '#FAF8F5';
        c.fillText('THERMAL: ±0.3°C', -80, 775);
        c.fillStyle = '#4285F4';
        c.fillText('ACCURACY: 99.2%', 200, 775);
        c.restore();
      }

      // 3. Bottom Academic Card (Y: 1220-1560)
      const acadP = easeOutBack(clamp((t - 136.0) * 1.5, 0, 1));
      if (acadP > 0) {
        c.save();
        c.translate(CW / 2, 1220 + (1 - acadP) * 50);
        c.globalAlpha = acadP;

        drawRoundRect(c, -450, 0, 900, 300, 32, '#FFFFFF', 'rgba(46, 139, 87, 0.25)', 2);

        drawRoundRect(c, 180, 35, 230, 42, 21, 'rgba(46, 139, 87, 0.12)', null);
        c.font = '700 18px "IBM Plex Sans Arabic", sans-serif';
        c.fillStyle = '#2E8B57';
        c.textAlign = 'center';
        c.fillText('🔬 أبحاث علمية موثقة', 295, 62);

        c.font = '700 34px "IBM Plex Sans Arabic", sans-serif';
        c.fillStyle = '#181816';
        c.textAlign = 'right';
        c.fillText('منهجية مبنية على أوراق وأبحاث محكّمة', 410, 125);

        c.font = '500 24px "IBM Plex Sans Arabic", sans-serif';
        c.fillStyle = '#5A5852';
        c.fillText('معمل أكاديمي وتطبيقي مغلق، يدمج الرؤية الحاسوبية والذكاء', 410, 178);
        c.fillText('الاصطناعي كحل عيني متكامل للقطاع الزراعي والداجني.', 410, 222);

        drawRoundRect(c, -410, 240, 820, 42, 12, '#FAF8F5', 'rgba(24, 24, 22, 0.06)', 1);
        c.font = '700 16px "Plus Jakarta Sans", monospace';
        c.fillStyle = '#2E8B57';
        c.textAlign = 'center';
        c.fillText('PUBLIC RELEASE ROADMAP • STRICT SCIENTIFIC BENCHMARKS', 0, 267);
        c.restore();
      }
    }

    // --- SCENE 6 RENDERER: The Finale — Vertical Hero Poster ---
    function renderScene6(c, t, p) {
      c.direction = 'rtl';
      // 1. Center Grand Emblem & Dual Orbital Rings (Y: 220-640)
      const emblemP = easeOutBack(clamp(p * 2, 0, 1));
      c.save();
      c.translate(CW / 2, 380);
      c.scale(emblemP, emblemP);

      const rot = t * 0.5;
      c.save();
      c.rotate(rot);
      c.strokeStyle = 'rgba(217, 119, 87, 0.25)';
      c.lineWidth = 3;
      c.setLineDash([20, 15]);
      c.beginPath();
      c.arc(0, 0, 150, 0, Math.PI * 2);
      c.stroke();
      c.restore();

      c.save();
      c.rotate(-rot * 1.3);
      c.strokeStyle = 'rgba(66, 133, 244, 0.2)';
      c.lineWidth = 2;
      c.setLineDash([30, 20]);
      c.beginPath();
      c.arc(0, 0, 185, 0, Math.PI * 2);
      c.stroke();
      c.restore();

      c.shadowColor = 'rgba(217, 119, 87, 0.35)';
      c.shadowBlur = 45;
      drawRoundRect(c, -75, -75, 150, 150, 46, '#181816', '#D97757', 3);
      c.shadowBlur = 0;

      c.font = '800 76px "Plus Jakarta Sans", sans-serif';
      c.fillStyle = '#FAF8F5';
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText('T', 0, 5);
      c.restore();

      // 2. Bold Typography Zone (Y: 620-960)
      const textP = easeOutCubic(clamp((t - 146.0) * 1.5, 0, 1));
      if (textP > 0) {
        c.save();
        c.translate(CW / 2, 620 + (1 - textP) * 50);
        c.globalAlpha = textP;

        c.font = 'italic 42px "Instrument Serif", Georgia, serif';
        c.fillStyle = '#D97757';
        c.textAlign = 'center';
        c.fillText('Smarter. Faster. Built to serve you.', 0, 0);

        c.font = '800 58px "IBM Plex Sans Arabic", sans-serif';
        c.fillStyle = '#181816';
        c.fillText('تولزي.. القادم أذكى،', 0, 80);
        c.fillStyle = '#D97757';
        c.fillText('أسرع، ومصنوع ليخدمك.', 0, 155);

        c.font = '500 26px "IBM Plex Sans Arabic", sans-serif';
        c.fillStyle = '#716F68';
        c.fillText('بوابة استكشاف وتعلم هي الأسرع، ومحرك إنتاجية عربي ينافس عالمياً.', 0, 230);
        c.restore();
      }

      // 3. Bottom 3 Compact Summary Badges Stack (Y: 960-1540)
      const badgesP = easeOutBack(clamp((t - 150.0) * 1.5, 0, 1));
      if (badgesP > 0) {
        c.save();
        c.translate(CW / 2, 980 + (1 - badgesP) * 50);
        c.scale(badgesP, badgesP);

        const summaryBadges = [
          {
            tag: "بوابة الاستكشاف",
            title: "tolzy.me",
            desc: "أكبر وأسرع دليل أدوات وكورسات ذكاء اصطناعي في الوطن العربي",
            accent: "#4285F4"
          },
          {
            tag: "محرك الإنتاجية",
            title: "TOLZY Flow",
            desc: "صناعة مستندات الأوفيس الاحترافية المدعومة بمحرك AXIOM V2",
            accent: "#D97757"
          },
          {
            tag: "معمل الابتكار",
            title: "TOLZY Agri Lab",
            desc: "أبحاث علمية في الرؤية الحاسوبية والذكاء الاصطناعي الزراعي",
            accent: "#2E8B57"
          }
        ];

        summaryBadges.forEach((sb, idx) => {
          const sy = idx * 165;
          drawRoundRect(c, -450, sy, 900, 140, 28, '#FFFFFF', sb.accent + '40', 2);

          drawRoundRect(c, 410, sy + 25, 12, 90, 6, sb.accent, null);

          c.font = '800 32px "Plus Jakarta Sans", sans-serif';
          c.fillStyle = '#181816';
          c.textAlign = 'right';
          c.fillText(sb.title, 380, sy + 60);

          drawRoundRect(c, -410, sy + 30, 180, 36, 18, sb.accent + '15', null);
          c.font = '700 16px "IBM Plex Sans Arabic", sans-serif';
          c.fillStyle = sb.accent;
          c.textAlign = 'center';
          c.fillText(sb.tag, -320, sy + 54);

          c.font = '500 20px "IBM Plex Sans Arabic", sans-serif';
          c.fillStyle = '#5A5852';
          c.textAlign = 'right';
          c.fillText(sb.desc, 380, sy + 105);
        });

        c.font = '700 18px "Plus Jakarta Sans", monospace';
        c.fillStyle = 'rgba(24, 24, 22, 0.4)';
        c.textAlign = 'center';
        c.fillText('TOLZY ECOSYSTEM • BUILT FOR THE FUTURE', 0, 520);
        c.restore();
      }
    }

    // --- REELS STYLE DYNAMIC SUBTITLES RENDERER ON CANVAS ---
    function renderSubtitlesOnCanvas(c, currentSub) {
      if (!currentSub || !showSubtitles) return;
      c.save();
      c.direction = 'rtl';
      const text = currentSub.text;
      c.font = '600 30px "IBM Plex Sans Arabic", sans-serif';
      
      const words = text.split(' ');
      let line1 = '', line2 = '';
      for (let i = 0; i < words.length; i++) {
        const testLine = line1 ? line1 + ' ' + words[i] : words[i];
        if (c.measureText(testLine).width < 760 || i === 0) {
          line1 = testLine;
        } else {
          line2 = words.slice(i).join(' ');
          break;
        }
      }
      
      const hasTwoLines = line2.length > 0;
      const pillH = hasTwoLines ? 115 : 76;
      const pillW = Math.min(940, Math.max(c.measureText(line1).width, c.measureText(line2).width) + 90);
      const pillY = 1680 - (hasTwoLines ? 25 : 0);
      
      c.shadowColor = 'rgba(0, 0, 0, 0.45)';
      c.shadowBlur = 30;
      c.shadowOffsetY = 8;
      drawRoundRect(c, CW / 2 - pillW / 2, pillY, pillW, pillH, pillH / 2, 'rgba(24, 24, 22, 0.94)', 'rgba(255, 255, 255, 0.16)', 2);
      c.shadowBlur = 0;
      c.shadowOffsetY = 0;

      c.fillStyle = '#FAF8F5';
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      if (hasTwoLines) {
        c.fillText(line1, CW / 2, pillY + 36);
        c.fillText(line2, CW / 2, pillY + 78);
      } else {
        c.fillText(line1, CW / 2, pillY + pillH / 2 + 2);
      }
      c.restore();
    }

    // --- MAIN 60FPS ANIMATION LOOP ---
    function renderFrame() {
      const currentTime = audio.currentTime || 0;
      const duration = audio.duration || 160;

      // Clear with warm cream background
      ctx.fillStyle = '#FAF8F5';
      ctx.fillRect(0, 0, CW, CH);

      // Current active scene
      let activeScene = SCENES[0];
      for (let i = 0; i < SCENES.length; i++) {
        if (currentTime >= SCENES[i].start && currentTime <= SCENES[i].end) {
          activeScene = SCENES[i];
          break;
        }
      }

      const sceneProgress = clamp((currentTime - activeScene.start) / (activeScene.end - activeScene.start), 0, 1);

      drawDotGrid(ctx, currentTime);
      drawAmbientGlow(ctx, currentTime, activeScene.accent);
      drawPhoneStatusBar(ctx);

      switch (activeScene.id) {
        case 1:
          renderScene1(ctx, currentTime, sceneProgress);
          break;
        case 2:
          renderScene2(ctx, currentTime, sceneProgress);
          break;
        case 3:
          renderScene3(ctx, currentTime, sceneProgress);
          break;
        case 4:
          renderScene4(ctx, currentTime, sceneProgress);
          break;
        case 5:
          renderScene5(ctx, currentTime, sceneProgress);
          break;
        case 6:
          renderScene6(ctx, currentTime, sceneProgress);
          break;
      }

      const currentSub = SUBTITLES.find(s => currentTime >= s.start && currentTime <= s.end);

      if (showSubtitles && currentSub) {
        renderSubtitlesOnCanvas(ctx, currentSub);
      }

      drawHomeIndicator(ctx);

      updateDOMUI(currentTime, duration, activeScene, currentSub);

      requestAnimationFrame(renderFrame);
    }

    // --- DOM UI SYNCHRONIZATION ---
    function updateDOMUI(time, duration, scene, sub) {
      if (!isExporting) {
        document.getElementById('timelineScrubber').value = time;
        document.getElementById('timeDisplay').innerText = formatTime(time) + ' / ' + formatTime(duration);
        document.getElementById('activeSceneBadge').innerText = scene.name;

        const subPill = document.getElementById('subtitlesPillContainer');
        const subText = document.getElementById('subtitlesText');
        if (showSubtitles && sub) {
          subPill.style.opacity = '1';
          subPill.style.transform = 'translateY(0)';
          subText.innerText = sub.text;
        } else {
          subPill.style.opacity = '0';
          subPill.style.transform = 'translateY(10px)';
        }
      } else {
        const percent = Math.min(100, Math.floor((time / duration) * 100));
        document.getElementById('recProgressText').innerText = formatTime(time) + ' / ' + formatTime(duration) + ' (' + percent + '%)';
      }
    }

    function formatTime(sec) {
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60);
      return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
    }

    // --- PLAYBACK CONTROLS ---
    function togglePlayPause() {
      if (isExporting) return;
      if (audio.paused) {
        audio.play().catch(e => console.log('Autoplay prevented:', e));
        document.getElementById('playIcon').classList.add('hidden');
        document.getElementById('pauseIcon').classList.remove('hidden');
      } else {
        audio.pause();
        document.getElementById('playIcon').classList.remove('hidden');
        document.getElementById('pauseIcon').classList.add('hidden');
      }
    }

    function onScrub(val) {
      audio.currentTime = parseFloat(val);
    }

    function jumpToScene(sceneId) {
      const scene = SCENES.find(s => s.id === sceneId);
      if (scene) {
        audio.currentTime = scene.start + 0.1;
        if (audio.paused) audio.play();
      }
    }

    function toggleSubtitles() {
      showSubtitles = !showSubtitles;
      document.getElementById('subsState').innerText = showSubtitles ? 'مفعلة' : 'معطلة';
      document.getElementById('subsState').className = showSubtitles ? 'font-bold text-brand-coral' : 'font-bold text-white/40';
      showToast(showSubtitles ? 'تم تفعيل الترجمة النصية' : 'تم إخفاء الترجمة النصية');
    }

    function toggleCleanMode() {
      isCleanMode = !isCleanMode;
      document.body.classList.toggle('clean-mode', isCleanMode);
      const notice = document.getElementById('cleanModeNotice');
      if (isCleanMode) {
        notice.classList.remove('hidden');
        setTimeout(() => notice.style.opacity = '1', 50);
        setTimeout(() => notice.style.opacity = '0', 3000);
      } else {
        notice.classList.add('hidden');
      }
    }

    function loadCustomAudio(input) {
      if (input.files && input.files[0]) {
        const file = input.files[0];
        const url = URL.createObjectURL(file);
        audio.src = url;
        audio.load();
        showToast('تم تحميل الملف الصوتي: ' + file.name);
      }
    }

    function showToast(msg) {
      const toast = document.getElementById('toast');
      document.getElementById('toastMessage').innerText = msg;
      toast.style.transform = 'translateY(0)';
      toast.style.opacity = '1';
      setTimeout(() => {
        toast.style.transform = 'translateY(-50px)';
        toast.style.opacity = '0';
      }, 3500);
    }

    // --- 4. BUILT-IN MP4 / HIGH-BITRATE VIDEO EXPORT ENGINE ---
    async function startExport() {
      if (isExporting) return;

      if (!window.MediaRecorder) {
        alert('MediaRecorder غير مدعوم في هذا المتصفح. يرجى استخدام Google Chrome أو Microsoft Edge.');
        return;
      }

      // Check supported codecs (Prefer MP4 H.264/AAC, fallback to WebM VP9/Opus)
      const mimeTypes = [
        'video/mp4;codecs=avc1,mp4a.40.2',
        'video/mp4;codecs=avc1',
        'video/mp4',
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm'
      ];
      let selectedMime = mimeTypes.find(type => MediaRecorder.isTypeSupported(type)) || 'video/webm';
      const isMp4 = selectedMime.includes('mp4');

      console.log('Selected recording MIME type:', selectedMime);

      // Web Audio API Routing for crystal-clear internal audio capture
      try {
        if (!audioCtx) {
          audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
          await audioCtx.resume();
        }

        if (!audioSourceNode) {
          audioSourceNode = audioCtx.createMediaElementSource(audio);
        }

        if (!audioDestNode) {
          audioDestNode = audioCtx.createMediaStreamDestination();
          audioSourceNode.connect(audioDestNode);
          audioSourceNode.connect(audioCtx.destination);
        }
      } catch (err) {
        console.warn('AudioContext notice:', err);
      }

      // Capture 60FPS stream from 1080x1920 Stage Canvas
      const canvasStream = canvas.captureStream(60);

      const combinedTracks = [...canvasStream.getVideoTracks()];
      if (audioDestNode && audioDestNode.stream.getAudioTracks().length > 0) {
        combinedTracks.push(...audioDestNode.stream.getAudioTracks());
      }

      const exportStream = new MediaStream(combinedTracks);

      recordedBlobs = [];
      try {
        mediaRecorder = new MediaRecorder(exportStream, {
          mimeType: selectedMime,
          videoBitsPerSecond: 12000000 // 12 Mbps
        });
      } catch (err) {
        console.warn('Fallback to standard bitrate:', err);
        mediaRecorder = new MediaRecorder(exportStream, { mimeType: selectedMime });
      }

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedBlobs.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        isExporting = false;
        document.body.classList.remove('clean-mode');
        const statusBar = document.getElementById('recordingStatusBar');
        statusBar.style.opacity = '0';
        statusBar.style.pointerEvents = 'none';

        if (recordedBlobs.length === 0) {
          alert('تعذر إتمام التسجيل: لم يتم التقاط بيانات.');
          return;
        }

        const blob = new Blob(recordedBlobs, { type: selectedMime });
        const downloadUrl = URL.createObjectURL(blob);
        const fileName = isMp4 ? 'TOLZY_Future_9x16.mp4' : 'TOLZY_Future_9x16.webm';

        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = downloadUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(downloadUrl);
        }, 100);

        showToast('🎉 تم تصدير وتحميل الفيديو بنجاح (' + (blob.size / (1024 * 1024)).toFixed(1) + ' MB)');
      };

      // 1. Enter Clean Mode (hiding all studio UI controls)
      isExporting = true;
      document.body.classList.add('clean-mode');

      // Show recording status bar
      const statusBar = document.getElementById('recordingStatusBar');
      statusBar.style.opacity = '1';
      statusBar.style.pointerEvents = 'auto';

      // 2. Reset timeline and voiceover to 00:00
      audio.currentTime = 0;

      // 3. Start recording & play full synchronized animation
      mediaRecorder.start(1000);
      audio.play().catch(e => console.error('Audio play error:', e));

      // 4. On ended, stop recorder and trigger auto-download
      audio.onended = () => {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop();
        }
      };
    }

    function cancelExport() {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }
      audio.pause();
      isExporting = false;
      document.body.classList.remove('clean-mode');
      const statusBar = document.getElementById('recordingStatusBar');
      statusBar.style.opacity = '0';
      statusBar.style.pointerEvents = 'none';
      showToast('تم إلغاء التصدير');
    }

    // --- KEYBOARD SHORTCUTS ---
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.code === 'KeyH') {
        toggleCleanMode();
      } else if (e.code === 'KeyS') {
        toggleSubtitles();
      } else if (e.code === 'KeyR') {
        audio.currentTime = 0;
      } else if (e.code === 'KeyE') {
        startExport();
      } else if (e.key >= '1' && e.key <= '6') {
        jumpToScene(parseInt(e.key));
      }
    });

    // Start engine when fonts are loaded
    document.fonts.ready.then(() => {
      console.log('Fonts loaded. Starting 60FPS motion canvas...');
      renderFrame();
    });
  </script>
</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, 'tolzy_future_motion.html'), htmlTemplate, 'utf8');
console.log('Successfully updated tolzy_future_motion.html!');
const stats = fs.statSync(path.join(__dirname, 'tolzy_future_motion.html'));
console.log('File size:', (stats.size / 1024 / 1024).toFixed(2), 'MB');
