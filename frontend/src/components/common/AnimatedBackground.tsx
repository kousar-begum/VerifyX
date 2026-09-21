import React, { useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { ShieldCheck, FileCheck, ScanLine, Fingerprint, Eye, Binary } from 'lucide-react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseAlpha: number;
  color: string;
}

interface PulsePacket {
  fromIndex: number;
  toIndex: number;
  progress: number;
  speed: number;
}

export const AnimatedBackground: React.FC = () => {
  const { theme, reducedMotion } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: -1000, y: -1000, active: false });

  // Neural Particle & Constellation Canvas Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const handlePointerMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY, active: true };
    };

    const handlePointerLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseleave', handlePointerLeave);

    // Initialize particles
    const particleCount = Math.min(Math.floor((width * height) / 32000), 40);
    const particles: Particle[] = [];
    const colors =
      theme === 'dark'
        ? ['#06b6d4', '#3b82f6', '#8b5cf6', '#0ea5e9']
        : ['#0284c7', '#2563eb', '#7c3aed', '#0891b2'];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 1.6 + 0.8,
        baseAlpha: Math.random() * 0.4 + 0.25,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const packets: PulsePacket[] = [];
    let lastPacketSpawn = Date.now();

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // If tab is hidden, skip intensive rendering
      if (document.hidden) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      // Update and draw particles
      const maxDistance = 120;
      const mouse = mouseRef.current;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (!reducedMotion) {
          p.x += p.vx;
          p.y += p.vy;

          // Screen wrap bounds
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          // Mouse gentle repel
          if (mouse.active) {
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 100 && dist > 0) {
              const force = (100 - dist) / 100;
              p.x += (dx / dist) * force * 1.5;
              p.y += (dy / dist) * force * 1.5;
            }
          }
        }

        // Draw particle node
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.baseAlpha;
        ctx.fill();

        // Connect nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            const lineAlpha = (1 - dist / maxDistance) * (theme === 'dark' ? 0.16 : 0.09);
            ctx.strokeStyle = p.color;
            ctx.globalAlpha = lineAlpha;
            ctx.lineWidth = 0.8;
            ctx.stroke();

            // Randomly spawn data packet pulse between connected nodes
            if (!reducedMotion && Date.now() - lastPacketSpawn > 1200 && packets.length < 8 && Math.random() < 0.05) {
              packets.push({
                fromIndex: i,
                toIndex: j,
                progress: 0,
                speed: 0.015 + Math.random() * 0.02,
              });
              lastPacketSpawn = Date.now();
            }
          }
        }
      }

      // Draw and advance data packet pulses along neural graph
      for (let k = packets.length - 1; k >= 0; k--) {
        const pkt = packets[k];
        pkt.progress += pkt.speed;

        if (pkt.progress >= 1) {
          packets.splice(k, 1);
          continue;
        }

        const pA = particles[pkt.fromIndex];
        const pB = particles[pkt.toIndex];
        if (!pA || !pB) {
          packets.splice(k, 1);
          continue;
        }

        const curX = pA.x + (pB.x - pA.x) * pkt.progress;
        const curY = pA.y + (pB.y - pA.y) * pkt.progress;

        ctx.beginPath();
        ctx.arc(curX, curY, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = '#06b6d4';
        ctx.globalAlpha = 0.85;
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      ctx.globalAlpha = 1;

      if (!reducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseleave', handlePointerLeave);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [theme, reducedMotion]);

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none">
      {/* Base theme solid tone background */}
      <div
        className={`absolute inset-0 transition-colors duration-500 ${
          theme === 'dark' ? 'bg-[#060a12]' : 'bg-[#f8fafc]'
        }`}
      />

      {/* Cyber Grid Pattern Backdrop */}
      <div
        className={`absolute inset-0 opacity-30 ${
          theme === 'dark' ? 'cyber-grid-dark' : 'cyber-grid-light'
        }`}
      />

      {/* Atmospheric Radial Ambient Light Glows */}
      <div
        className={`absolute -top-32 left-1/4 w-[32rem] h-[32rem] rounded-full blur-[100px] pointer-events-none transition-all duration-1000 ${
          theme === 'dark' ? 'bg-cyan-500/15' : 'bg-cyan-400/10'
        } ${reducedMotion ? '' : 'animate-float'}`}
      />

      <div
        className={`absolute top-1/3 -right-24 w-[36rem] h-[36rem] rounded-full blur-[110px] pointer-events-none transition-all duration-1000 ${
          theme === 'dark' ? 'bg-violet-600/15' : 'bg-blue-400/10'
        } ${reducedMotion ? '' : 'animate-float'}`}
        style={{ animationDelay: '2s' }}
      />

      <div
        className={`absolute -bottom-40 left-1/3 w-[40rem] h-[40rem] rounded-full blur-[120px] pointer-events-none transition-all duration-1000 ${
          theme === 'dark' ? 'bg-blue-600/15' : 'bg-indigo-300/15'
        }`}
      />

      {/* Live Interactive Neural Forensics Particle Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* 3D Cyber Horizon Wireframe Perspective Grid at Viewport Bottom */}
      <div className="absolute inset-x-0 bottom-0 h-64 overflow-hidden pointer-events-none opacity-40">
        <div
          className={`w-full h-full ${
            theme === 'dark' ? 'cyber-horizon-grid' : 'cyber-horizon-grid-light'
          }`}
        />
        <div
          className={`absolute inset-0 bg-gradient-to-t ${
            theme === 'dark'
              ? 'from-transparent via-[#060a12]/70 to-[#060a12]'
              : 'from-transparent via-[#f8fafc]/70 to-[#f8fafc]'
          }`}
        />
      </div>

      {/* MOVING SITE-SPECIFIC FORENSIC ELEMENTS */}
      {!reducedMotion && (
        <>
          {/* Element 1: Floating Holographic Forensic Document 1 (Top Left Drift) */}
          <div className="absolute top-28 left-8 sm:left-16 w-44 sm:w-56 h-56 sm:h-72 rounded-xl border border-cyan-500/25 bg-cyan-950/[0.04] dark:bg-cyan-950/[0.12] backdrop-blur-[1px] p-3 shadow-[0_0_30px_rgba(6,182,212,0.12)] animate-forensic-drift hidden md:block">
            {/* Holographic Header */}
            <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20 text-[9px] font-mono text-cyan-400/60">
              <div className="flex items-center gap-1">
                <FileCheck className="w-3 h-3 text-cyan-400" />
                <span>DOC_ID::904-F</span>
              </div>
              <span>VERIFIED</span>
            </div>

            {/* Document placeholder lines */}
            <div className="mt-3 space-y-2">
              <div className="h-1.5 w-3/4 rounded bg-cyan-500/20" />
              <div className="h-1.5 w-full rounded bg-cyan-500/15" />
              <div className="h-1.5 w-5/6 rounded bg-cyan-500/15" />
              <div className="h-1.5 w-1/2 rounded bg-cyan-500/20" />
            </div>

            {/* Floating Security Seal */}
            <div className="mt-4 p-2 rounded-lg border border-cyan-500/20 bg-cyan-500/[0.05] flex items-center gap-2">
              <div className="w-5 h-5 rounded-full border border-cyan-400/40 flex items-center justify-center">
                <ShieldCheck className="w-3 h-3 text-cyan-400" />
              </div>
              <div className="text-[8px] font-mono text-cyan-300/60 leading-tight">
                <div>HASH: 0x8F4E...2B</div>
                <div>AUTHENTIC</div>
              </div>
            </div>

            {/* Active Moving Laser Scan Bar */}
            <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-laser-sweep shadow-[0_0_12px_#06b6d4]" />
          </div>

          {/* Element 2: Floating Holographic Forensic Document 2 (Bottom Right Drift) */}
          <div className="absolute bottom-24 right-10 sm:right-20 w-48 sm:w-60 h-60 sm:h-76 rounded-xl border border-violet-500/25 bg-violet-950/[0.04] dark:bg-violet-950/[0.12] backdrop-blur-[1px] p-3 shadow-[0_0_30px_rgba(139,92,246,0.12)] animate-forensic-drift-reverse hidden lg:block">
            <div className="flex items-center justify-between pb-2 border-b border-violet-500/20 text-[9px] font-mono text-violet-400/60">
              <div className="flex items-center gap-1">
                <ScanLine className="w-3 h-3 text-violet-400" />
                <span>ELA_ANALYSIS_LAYER</span>
              </div>
              <span className="text-amber-400/70">RESIDUAL_DELTA</span>
            </div>

            {/* Document placeholder heat blocks */}
            <div className="mt-3 grid grid-cols-3 gap-1.5">
              <div className="h-8 rounded bg-cyan-500/10 border border-cyan-500/20" />
              <div className="h-8 rounded bg-rose-500/20 border border-rose-500/40 animate-pulse" />
              <div className="h-8 rounded bg-cyan-500/10 border border-cyan-500/20" />
              <div className="h-8 rounded bg-cyan-500/10 border border-cyan-500/20" />
              <div className="h-8 rounded bg-blue-500/15 border border-blue-500/30" />
              <div className="h-8 rounded bg-amber-500/20 border border-amber-500/30" />
            </div>

            <div className="mt-3 flex items-center justify-between text-[8px] font-mono text-violet-300/60">
              <span>SCANLINES: 1024</span>
              <span className="text-rose-400">ANOMALY: 0.88</span>
            </div>

            {/* Moving Laser Sweep Bar */}
            <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-violet-400 to-transparent animate-laser-sweep shadow-[0_0_12px_#8b5cf6]" />
          </div>

          {/* Element 3: Rotating Biometric Retina & Fingerprint Scanner Rings (Center Right) */}
          <div className="absolute top-1/4 right-8 sm:right-16 w-36 h-36 rounded-full border border-dashed border-cyan-500/20 flex items-center justify-center animate-spin-slow pointer-events-none hidden xl:flex">
            {/* Inner counter-rotating ring */}
            <div className="w-24 h-24 rounded-full border border-dashed border-blue-500/30 flex items-center justify-center animate-spin-counter">
              <div className="w-12 h-12 rounded-full border border-cyan-400/40 flex items-center justify-center bg-cyan-500/10">
                <Fingerprint className="w-6 h-6 text-cyan-400/60 animate-pulse" />
              </div>
            </div>
            {/* Cardinal crosshairs */}
            <span className="absolute top-0 w-1 h-2 bg-cyan-400/40" />
            <span className="absolute bottom-0 w-1 h-2 bg-cyan-400/40" />
            <span className="absolute left-0 h-1 w-2 bg-cyan-400/40" />
            <span className="absolute right-0 h-1 w-2 bg-cyan-400/40" />
          </div>

          {/* Element 4: Floating Verification Badges */}
          <div className="absolute top-44 left-1/3 px-3 py-1 rounded-full border border-cyan-500/30 bg-slate-900/60 backdrop-blur-sm text-[10px] font-mono text-cyan-400/70 flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.15)] animate-float hidden lg:flex">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>[SHA-256 HASH VERIFIED]</span>
          </div>

          <div
            className="absolute bottom-48 left-1/4 px-3 py-1 rounded-full border border-violet-500/30 bg-slate-900/60 backdrop-blur-sm text-[10px] font-mono text-violet-400/70 flex items-center gap-2 shadow-[0_0_15px_rgba(139,92,246,0.15)] animate-float hidden lg:flex"
            style={{ animationDelay: '1.5s' }}
          >
            <ScanLine className="w-3 h-3 text-cyan-400" />
            <span>[3D SPECTROGRAM // TOPOLOGY ACTIVE]</span>
          </div>

          <div
            className="absolute top-2/3 right-1/4 px-3 py-1 rounded-full border border-blue-500/30 bg-slate-900/60 backdrop-blur-sm text-[10px] font-mono text-blue-400/70 flex items-center gap-2 shadow-[0_0_15px_rgba(59,130,246,0.15)] animate-float hidden lg:flex"
            style={{ animationDelay: '3s' }}
          >
            <Binary className="w-3 h-3 text-blue-400" />
            <span>[INTEGRITY_SHIELD // 99.8%]</span>
          </div>

          {/* Element 5: Cascading Hexadecimal Data Rain Stream (Left edge) */}
          <div className="absolute top-0 left-4 font-mono text-[9px] text-cyan-500/25 leading-loose pointer-events-none hidden 2xl:block select-none animate-data-rain">
            <div>0x4F8A_VERIFY</div>
            <div>0x9E21_RESIDUAL</div>
            <div>0x1B88_ELA_TENSOR</div>
            <div>0x77FA_HASH_OK</div>
            <div>0xC091_SPECTRAL</div>
            <div>0x33DA_COORDINATE</div>
            <div>0x5F19_MATCH_99.4</div>
          </div>
        </>
      )}

      {/* Subtle Drift HUD Telemetry Watermarks in Margins */}
      <div className="absolute top-20 right-6 font-mono text-[9px] tracking-widest text-cyan-500/20 dark:text-cyan-400/20 hidden lg:block select-none">
        <div>SYS::VERIFYX_NODE_V2.4</div>
        <div>SPECTRAL_ELA_TENSORS::ONLINE</div>
        <div>HASH_VERIFICATION::SHA256</div>
      </div>

      <div className="absolute bottom-6 left-6 font-mono text-[9px] tracking-widest text-violet-500/20 dark:text-violet-400/20 hidden lg:block select-none">
        <div>COORDINATES // LATENCY_OPTIMIZED</div>
        <div>IDENTITY_INTEGRITY_SHIELD</div>
      </div>

      {/* Digital security scan line in dark mode */}
      {!reducedMotion && theme === 'dark' && (
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/[0.012] to-transparent pointer-events-none animate-scan-laser" />
      )}
    </div>
  );
};
