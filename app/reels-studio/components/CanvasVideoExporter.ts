import { SCENES, SUBTITLE_PHRASES, TOTAL_DURATION, COMPARISON_TOOLS } from '../data';

export interface ExportProgress {
  progress: number; // 0 to 1
  currentTime: number;
  currentFrame: number;
  totalFrames: number;
  status: string;
}

export class CanvasVideoExporter {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width = 1080;
  private height = 1920;
  private isExporting = false;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    const context = this.canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('Could not get 2D canvas context');
    this.ctx = context;
  }

  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * Draw a pristine 1080x1920 HD frame for a given timestamp
   */
  public renderFrameAt(time: number) {
    const { ctx, width, height } = this;

    // 1. Base dark background
    ctx.fillStyle = '#090A0F';
    ctx.fillRect(0, 0, width, height);

    // Subtle Grid Pattern
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // 2. Active Scene Computation
    const activeScene = SCENES.find((s, idx) =>
      time >= s.start && (idx === SCENES.length - 1 ? time <= s.end : time < s.end)
    ) || SCENES[SCENES.length - 1];
    const progress = Math.min(1, Math.max(0, (time - activeScene.start) / activeScene.duration));

    // Dynamic Ambient Glow
    const radGlow = ctx.createRadialGradient(
      width / 2,
      height * 0.4,
      100,
      width / 2,
      height * 0.4,
      700
    );
    radGlow.addColorStop(0, `${activeScene.themeColor}33`);
    radGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = radGlow;
    ctx.fillRect(0, 0, width, height);

    // 3. Render Top Safe-zone Header (Tolzy Branding)
    this.renderHeader(time);

    // 4. Render Active Scene Content
    switch (activeScene.id) {
      case 1:
        this.renderScene1(progress, time);
        break;
      case 2:
        this.renderScene2(progress);
        break;
      case 3:
        this.renderScene3(progress);
        break;
      case 4:
        this.renderScene4(progress);
        break;
      case 5:
        this.renderScene5(progress);
        break;
    }

    // 5. Render TikTok/Reels Style Captions
    this.renderCaptions(time);
  }

  private renderHeader(time: number) {
    const { ctx, width } = this;
    ctx.save();
    ctx.direction = 'rtl';
    ctx.textAlign = 'center';

    // Top Pill
    const pillY = 160;
    const pillWidth = 560;
    const pillHeight = 64;
    const pillX = (width - pillWidth) / 2;

    this.roundRect(pillX, pillY, pillWidth, pillHeight, 32);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Text
    ctx.font = 'bold 30px "Almarai", system-ui, sans-serif';
    ctx.fillStyle = '#fea619';
    ctx.fillText('تحديث TOLZY الجديد 2026 ⚡', width / 2, pillY + 43);

    ctx.restore();
  }

  private renderScene1(progress: number, time: number) {
    const { ctx, width, height } = this;
    ctx.save();
    ctx.direction = 'rtl';
    ctx.textAlign = 'center';

    const centerY = height * 0.42;

    // Orbiting Cascade Icons
    const tools = [
      { name: 'Cursor', icon: '⚡', color: '#beff50' },
      { name: 'v0.dev', icon: '🎨', color: '#38bdf8' },
      { name: 'Claude', icon: '🧠', color: '#f59e0b' },
      { name: 'Windsurf', icon: '🌊', color: '#06b6d4' },
      { name: 'Midjourney', icon: '✨', color: '#ec4899' },
      { name: 'ElevenLabs', icon: '🎙️', color: '#8b5cf6' },
    ];

    const angleOffset = time * 0.8;
    tools.forEach((tool, idx) => {
      const angle = (idx / tools.length) * Math.PI * 2 + angleOffset;
      const rx = 280;
      const ry = 160;
      const x = width / 2 + Math.cos(angle) * rx;
      const y = centerY + Math.sin(angle) * ry;

      // Icon Box
      this.roundRect(x - 45, y - 45, 90, 90, 24);
      ctx.fillStyle = 'rgba(15, 18, 30, 0.9)';
      ctx.fill();
      ctx.strokeStyle = `${tool.color}80`;
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.font = '40px system-ui';
      ctx.fillText(tool.icon, x, y + 14);

      // Label below
      ctx.font = 'bold 20px "Almarai", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(tool.name, x, y + 70);
    });

    // Central Core TOLZY Logo
    const logoSize = 180;
    const logoX = (width - logoSize) / 2;
    const logoY = centerY - logoSize / 2;

    this.roundRect(logoX, logoY, logoSize, logoSize, 40);
    ctx.fillStyle = '#090A0F';
    ctx.fill();
    ctx.strokeStyle = '#fea619';
    ctx.lineWidth = 6;
    ctx.stroke();

    ctx.font = '900 82px "Almarai", sans-serif';
    ctx.fillStyle = '#fea619';
    ctx.fillText('T', width / 2, centerY + 20);

    ctx.font = 'bold 24px "Almarai", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('TOLZY.ME', width / 2, centerY + 65);

    // Big Headline Text
    ctx.font = '900 68px "Almarai", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('عشان تختار أداة صح', width / 2, height * 0.63);

    ctx.fillStyle = '#fea619';
    ctx.fillText('من بين +1000 أداة AI!', width / 2, height * 0.68);

    ctx.font = '500 36px "Almarai", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillText('3 ميزات جديدة كلياً في تولزي هتغير طريقتك 🚀', width / 2, height * 0.74);

    ctx.restore();
  }

  private renderScene2(progress: number) {
    const { ctx, width, height } = this;
    ctx.save();
    ctx.direction = 'rtl';
    ctx.textAlign = 'center';

    ctx.font = '900 58px "Almarai", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('قارن بين 3 أدوات', width / 2, 280);
    ctx.fillStyle = '#beff50';
    ctx.fillText('وجهاً لوجه بضغطة زر ⚡', width / 2, 350);

    // 3 Cards
    const cardWidth = 920;
    const cardHeight = 160;
    const startY = 430;
    const gap = 30;

    const cursorSelected = progress >= 0.15;
    const windsurfSelected = progress >= 0.35;
    const copilotSelected = progress >= 0.52;

    COMPARISON_TOOLS.forEach((tool, idx) => {
      const isSelected =
        (idx === 0 && cursorSelected) ||
        (idx === 1 && windsurfSelected) ||
        (idx === 2 && copilotSelected);

      const y = startY + idx * (cardHeight + gap);
      const x = (width - cardWidth) / 2;

      this.roundRect(x, y, cardWidth, cardHeight, 32);
      ctx.fillStyle = isSelected ? 'rgba(190, 255, 80, 0.12)' : 'rgba(255, 255, 255, 0.06)';
      ctx.fill();
      ctx.strokeStyle = isSelected ? '#beff50' : 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = isSelected ? 4 : 2;
      ctx.stroke();

      // Tool Icon
      ctx.font = '50px system-ui';
      ctx.fillText(tool.logo, x + 840, y + 100);

      // Tool Name & Details
      ctx.textAlign = 'right';
      ctx.font = '900 42px "Almarai", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(tool.name, x + 760, y + 65);

      ctx.font = 'bold 28px "Almarai", sans-serif';
      ctx.fillStyle = '#beff50';
      ctx.fillText(tool.price, x + 760, y + 115);

      // Checkbox circle
      ctx.textAlign = 'center';
      this.roundRect(x + 50, y + 45, 70, 70, 20);
      ctx.fillStyle = isSelected ? '#beff50' : 'rgba(255, 255, 255, 0.1)';
      ctx.fill();
      ctx.font = 'bold 36px system-ui';
      ctx.fillStyle = isSelected ? '#000000' : 'rgba(255, 255, 255, 0.4)';
      ctx.fillText(isSelected ? '✓' : '+', x + 85, y + 92);
    });

    // Comparison Bottom Sheet
    if (progress >= 0.58) {
      const sheetY = height * 0.54;
      const sheetH = height - sheetY;

      this.roundRect(40, sheetY, width - 80, sheetH, 44);
      ctx.fillStyle = 'rgba(14, 17, 27, 0.96)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Sheet Header
      ctx.font = '900 38px "Almarai", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('جدول المقارنة المباشرة (3 أدوات)', width / 2, sheetY + 70);

      // Table Row 1: السعر
      this.renderTableRow(sheetY + 120, 'السعر 💰', '20$ Pro', '15$ Pro', '10$/شهر');
      // Table Row 2: دعم العربية
      this.renderTableRow(sheetY + 220, 'دعم العربية', 'كامل 100%', 'ممتاز 95%', 'جيد 80%');
      // Table Row 3: أهم ميزة
      this.renderTableRow(sheetY + 320, 'أهم ميزة ✨', 'Cascade', 'Flows', 'GitHub');
    }

    ctx.restore();
  }

  private renderTableRow(y: number, label: string, v1: string, v2: string, v3: string) {
    const { ctx, width } = this;
    const x = 70;
    const w = width - 140;

    this.roundRect(x, y, w, 80, 20);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fill();

    ctx.textAlign = 'right';
    ctx.font = 'bold 28px "Almarai", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(label, x + w - 30, y + 50);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#beff50';
    ctx.fillText(v1, x + 440, y + 50);
    ctx.fillStyle = '#06b6d4';
    ctx.fillText(v2, x + 270, y + 50);
    ctx.fillStyle = '#a855f7';
    ctx.fillText(v3, x + 100, y + 50);
  }

  private renderScene3(progress: number) {
    const { ctx, width, height } = this;
    ctx.save();
    ctx.direction = 'rtl';
    ctx.textAlign = 'center';

    ctx.font = '900 58px "Almarai", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('المنشن التفاعلي الذكي', width / 2, 280);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('اكتب @ لأي أداة في المنتدى! 💬', width / 2, 350);

    const isFlipped = progress >= 0.68;

    if (!isFlipped) {
      // Post Editor Card
      const cardW = 920;
      const cardH = 680;
      const cardX = (width - cardW) / 2;
      const cardY = 440;

      this.roundRect(cardX, cardY, cardW, cardH, 36);
      ctx.fillStyle = 'rgba(18, 22, 36, 0.95)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 3;
      ctx.stroke();

      // User info
      ctx.textAlign = 'right';
      ctx.font = 'bold 36px "Almarai", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('م. أحمد النجار 👨‍💻', cardX + cardW - 60, cardY + 75);

      ctx.font = '500 24px "Almarai", sans-serif';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('@ahmed_dev • منتدى تولزي', cardX + cardW - 60, cardY + 115);

      // Text box
      this.roundRect(cardX + 40, cardY + 160, cardW - 80, 360, 24);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fill();

      let text = 'جربت اليوم أداة ';
      if (progress >= 0.20 && progress < 0.28) text = 'جربت اليوم أداة @';
      else if (progress >= 0.28 && progress < 0.48) text = 'جربت اليوم أداة @Cur';

      ctx.font = 'bold 36px "Almarai", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(text, cardX + cardW - 80, cardY + 230);

      // Autocomplete Popup
      if (progress >= 0.28 && progress < 0.48) {
        this.roundRect(cardX + 280, cardY + 260, 480, 140, 20);
        ctx.fillStyle = '#111422';
        ctx.fill();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.font = 'bold 32px "Almarai", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('⚡ Cursor AI', cardX + 680, cardY + 340);
      }

      // Transformed Bento inside post
      if (progress >= 0.48) {
        this.roundRect(cardX + 80, cardY + 290, cardW - 160, 160, 24);
        ctx.fillStyle = 'rgba(190, 255, 80, 0.15)';
        ctx.fill();
        ctx.strokeStyle = '#beff50';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.font = 'bold 38px "Almarai", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('⚡ Cursor AI - محرر الأكواد الذكي', cardX + cardW - 120, cardY + 370);
        ctx.font = 'bold 28px "Almarai", sans-serif';
        ctx.fillStyle = '#beff50';
        ctx.fillText('تقييم 4.9 ⭐ • تصفح الأداة ↗', cardX + cardW - 120, cardY + 415);
      }
    } else {
      // /tools/cursor directory page
      const pageW = 920;
      const pageH = 680;
      const pageX = (width - pageW) / 2;
      const pageY = 440;

      this.roundRect(pageX, pageY, pageW, pageH, 36);
      ctx.fillStyle = '#0c0e18';
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Tool URL Bar
      this.roundRect(pageX + 40, pageY + 35, pageW - 80, 60, 16);
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fill();
      ctx.textAlign = 'right';
      ctx.font = 'bold 24px monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('tolzy.me/tools/cursor ⚡', pageX + pageW - 70, pageY + 75);

      // Community section header
      ctx.font = '900 36px "Almarai", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('نقاشات المجتمع حول أداة Cursor', pageX + pageW - 60, pageY + 160);

      // Auto-linked Post box
      this.roundRect(pageX + 40, pageY + 200, pageW - 80, 280, 24);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.fill();
      ctx.strokeStyle = '#beff50';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.font = 'bold 28px "Almarai", sans-serif';
      ctx.fillStyle = '#beff50';
      ctx.fillText('⚡ مرتبط تلقائياً من المنتدى', pageX + pageW - 70, pageY + 250);

      ctx.font = '500 28px "Almarai", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('م. أحمد النجار: جربت اليوم أداة Cursor AI...', pageX + pageW - 70, pageY + 310);
    }

    ctx.restore();
  }

  private renderScene4(progress: number) {
    const { ctx, width } = this;
    ctx.save();
    ctx.direction = 'rtl';
    ctx.textAlign = 'center';

    ctx.font = '900 58px "Almarai", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('حزم الأدوات والتصويت الحي', width / 2, 280);
    ctx.fillStyle = '#a855f7';
    ctx.fillText('Tech Stacks & Live Polls 📊', width / 2, 350);

    const isCopied = progress >= 0.25;
    const isVoted = progress >= 0.60;

    // CARD 1: Tech Stack
    const cardW = 920;
    const c1Y = 430;
    const c1H = 360;
    const c1X = (width - cardW) / 2;

    this.roundRect(c1X, c1Y, cardW, c1H, 32);
    ctx.fillStyle = 'rgba(18, 20, 32, 0.95)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.35)';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.textAlign = 'right';
    ctx.font = '900 36px "Almarai", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('حزمة المطور الذكي (Full-Stack AI) 🔥', c1X + cardW - 50, c1Y + 70);

    // 4 Stack Pills
    const tools = ['⚡ Cursor AI', '🎨 v0.dev', '⚡ Supabase', '🧠 Claude 3.5'];
    tools.forEach((t, i) => {
      const px = c1X + (i % 2 === 0 ? cardW - 440 : cardW - 880);
      const py = c1Y + 110 + Math.floor(i / 2) * 80;
      this.roundRect(px, py, 410, 65, 18);
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.fill();
      ctx.font = 'bold 28px "Almarai", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(t, px + 380, py + 43);
    });

    // Copy Button
    this.roundRect(c1X + 40, c1Y + 270, cardW - 80, 65, 20);
    ctx.fillStyle = isCopied ? '#10b981' : '#a855f7';
    ctx.fill();
    ctx.textAlign = 'center';
    ctx.font = '900 30px "Almarai", sans-serif';
    ctx.fillStyle = isCopied ? '#000000' : '#ffffff';
    ctx.fillText(isCopied ? 'تم نسخ 4 أدوات لحسابك! ✅' : 'نسخ الحزمة 📋', width / 2, c1Y + 313);

    // CARD 2: Live VS Poll
    const c2Y = 820;
    const c2H = 340;
    this.roundRect(c1X, c2Y, cardW, c2H, 32);
    ctx.fillStyle = 'rgba(18, 20, 32, 0.95)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(190, 255, 80, 0.35)';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.textAlign = 'right';
    ctx.font = '900 34px "Almarai", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('تصويت حي: أقوى محرر برمجي في 2026؟ ⚔️', c1X + cardW - 50, c2Y + 65);

    // Option 1: Cursor
    this.roundRect(c1X + 40, c2Y + 105, cardW - 80, 85, 20);
    ctx.fillStyle = isVoted ? 'rgba(190, 255, 80, 0.25)' : 'rgba(255, 255, 255, 0.05)';
    ctx.fill();
    ctx.font = 'bold 32px "Almarai", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('⚡ Cursor AI', c1X + cardW - 80, c2Y + 158);
    ctx.textAlign = 'left';
    ctx.font = '900 36px "Almarai", sans-serif';
    ctx.fillStyle = '#beff50';
    ctx.fillText(isVoted ? '68%' : 'تصويت', c1X + 80, c2Y + 160);

    // Option 2: Windsurf
    ctx.textAlign = 'right';
    this.roundRect(c1X + 40, c2Y + 215, cardW - 80, 85, 20);
    ctx.fillStyle = isVoted ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255, 255, 255, 0.05)';
    ctx.fill();
    ctx.font = 'bold 32px "Almarai", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('🌊 Windsurf Editor', c1X + cardW - 80, c2Y + 268);
    ctx.textAlign = 'left';
    ctx.font = '900 36px "Almarai", sans-serif';
    ctx.fillStyle = '#06b6d4';
    ctx.fillText(isVoted ? '32%' : 'تصويت', c1X + 80, c2Y + 270);

    ctx.restore();
  }

  private renderScene5(progress: number) {
    const { ctx, width, height } = this;
    ctx.save();
    ctx.direction = 'rtl';
    ctx.textAlign = 'center';

    // Giant Outro Card
    const logoSize = 220;
    const logoX = (width - logoSize) / 2;
    const logoY = height * 0.28;

    this.roundRect(logoX, logoY, logoSize, logoSize, 50);
    ctx.fillStyle = '#090A0F';
    ctx.fill();
    ctx.strokeStyle = '#fea619';
    ctx.lineWidth = 8;
    ctx.stroke();

    ctx.font = '900 110px "Almarai", sans-serif';
    ctx.fillStyle = '#fea619';
    ctx.fillText('T', width / 2, logoY + 135);

    ctx.font = 'bold 28px "Almarai", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('TOLZY', width / 2, logoY + 185);

    // Headlines
    ctx.font = '900 74px "Almarai", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('جربها الآن مجاناً', width / 2, height * 0.52);

    ctx.fillStyle = '#fea619';
    ctx.fillText('على tolzy.me 🚀', width / 2, height * 0.58);

    ctx.font = '500 36px "Almarai", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fillText('أكبر دليل عربي لأدوات الذكاء الاصطناعي 2026', width / 2, height * 0.65);

    // CTA Button
    const btnW = 680;
    const btnH = 95;
    const btnX = (width - btnW) / 2;
    const btnY = height * 0.72;

    this.roundRect(btnX, btnY, btnW, btnH, 30);
    ctx.fillStyle = '#fea619';
    ctx.fill();

    ctx.font = '900 40px "Almarai", sans-serif';
    ctx.fillStyle = '#000000';
    ctx.fillText('اكتشف تولزي الآن ⚡', width / 2, btnY + 62);

    ctx.restore();
  }

  private renderCaptions(time: number) {
    const activePhrase = SUBTITLE_PHRASES.find(
      (p) => time >= p.start && time <= p.end
    );
    if (!activePhrase) return;

    const { ctx, width, height } = this;
    ctx.save();
    ctx.direction = 'rtl';
    ctx.textAlign = 'center';

    const pillY = height * 0.82;
    const pillH = 100;
    const pillW = 900;
    const pillX = (width - pillW) / 2;

    this.roundRect(pillX, pillY, pillW, pillH, 32);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.88)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(254, 166, 25, 0.4)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw active phrase text
    ctx.font = 'bold 36px "Almarai", sans-serif';

    // Measure and render words with active highlight
    let totalText = activePhrase.phrase;
    const activeWord = activePhrase.words.find(
      (w) => time >= w.start && time <= w.end
    );

    if (activeWord) {
      ctx.fillStyle = '#fea619';
      ctx.fillText(totalText, width / 2, pillY + 62);
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.fillText(totalText, width / 2, pillY + 62);
    }

    ctx.restore();
  }

  private roundRect(x: number, y: number, w: number, h: number, r: number) {
    const { ctx } = this;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  /**
   * Start 60fps recording with synchronized Web Audio track and export to MP4 / WebM
   */
  public async exportVideo(
    audioElement: HTMLAudioElement,
    onProgress: (p: ExportProgress) => void
  ): Promise<Blob> {
    if (this.isExporting) throw new Error('Export already in progress');
    this.isExporting = true;
    this.recordedChunks = [];

    // Setup Web Audio API routing
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    const sourceNode = audioContext.createMediaElementSource(audioElement);
    const audioDest = audioContext.createMediaStreamDestination();
    sourceNode.connect(audioDest);
    sourceNode.connect(audioContext.destination); // Let user hear or monitor if needed

    // Capture 60fps stream from canvas
    const canvasStream = this.canvas.captureStream(60);

    // Combine video + audio streams into unified stream
    const combinedStream = new MediaStream([
      ...canvasStream.getVideoTracks(),
      ...audioDest.stream.getAudioTracks(),
    ]);

    // Determine supported mime type
    const mimeTypes = [
      'video/mp4;codecs=avc1,mp4a.40.2',
      'video/mp4',
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
    ];

    let selectedMimeType = '';
    for (const mime of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mime)) {
        selectedMimeType = mime;
        break;
      }
    }

    if (!selectedMimeType) {
      selectedMimeType = 'video/webm';
    }

    console.log('[CanvasVideoExporter] Recording with MIME type:', selectedMimeType);

    this.mediaRecorder = new MediaRecorder(combinedStream, {
      mimeType: selectedMimeType,
      videoBitsPerSecond: 8_000_000, // 8 Mbps for pristine 1080x1920
    });

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };

    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) return reject(new Error('MediaRecorder init failed'));

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: selectedMimeType });
        this.isExporting = false;
        resolve(blob);
      };

      this.mediaRecorder.onerror = (err) => {
        this.isExporting = false;
        reject(err);
      };

      // Reset audio and start playback
      audioElement.currentTime = 0;
      this.mediaRecorder.start(100); // 100ms chunks

      audioElement.play().catch((err) => {
        console.warn('Audio play error during export:', err);
      });

      const fps = 60;
      const totalFrames = Math.ceil(TOTAL_DURATION * fps);
      let currentFrame = 0;

      const frameInterval = 1000 / fps;
      let lastTime = performance.now();

      const renderLoop = (now: number) => {
        if (!this.isExporting) return;

        const delta = now - lastTime;
        if (delta >= frameInterval) {
          const currentTime = audioElement.currentTime;
          this.renderFrameAt(currentTime);

          currentFrame++;
          const progress = Math.min(1, currentTime / TOTAL_DURATION);

          onProgress({
            progress,
            currentTime,
            currentFrame,
            totalFrames,
            status: `جاري تسجيل الإطارات بدقة 1080x1920... (${Math.round(progress * 100)}%)`,
          });

          lastTime = now - (delta % frameInterval);

          if (currentTime >= TOTAL_DURATION || currentFrame >= totalFrames) {
            audioElement.pause();
            this.mediaRecorder?.stop();
            return;
          }
        }

        requestAnimationFrame(renderLoop);
      };

      requestAnimationFrame(renderLoop);
    });
  }

  public cancelExport() {
    this.isExporting = false;
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
  }
}
