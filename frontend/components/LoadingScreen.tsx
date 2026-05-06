import { useEffect, useState } from "react";

export default function LoadingScreen() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFadeOut(true), 2800);
    const remove = setTimeout(() => setVisible(false), 3400);
    return () => { clearTimeout(timer); clearTimeout(remove); };
  }, []);

  if (!visible) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "#080808",
      display: "flex", alignItems: "center", justifyContent: "center",
      opacity: fadeOut ? 0 : 1,
      transition: "opacity 0.6s ease",
      pointerEvents: fadeOut ? "none" : "all",
    }}>
      <svg width="100%" height="100%" viewBox="0 0 680 480" xmlns="http://www.w3.org/2000/svg">
        <style>{`
          @keyframes growRoot {
            from { stroke-dashoffset: var(--len); opacity: 0; }
            to { stroke-dashoffset: 0; opacity: 1; }
          }
          @keyframes rotateMin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes rotateHour { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes pulse { 0%,100% { opacity:1; r:5; } 50% { opacity:0.5; r:7; } }
          @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
          @keyframes shimmer { 0%,100% { opacity:0.18; } 50% { opacity:0.38; } }
          .r { fill: none; stroke-linecap: round; stroke-linejoin: round; animation: growRoot ease forwards; opacity: 0; }
          .min-g  { transform-origin: 340px 230px; animation: rotateMin 5s linear infinite; }
          .hour-g { transform-origin: 340px 230px; animation: rotateHour 60s linear infinite; }
          .cdot   { animation: pulse 2s ease-in-out infinite; }
          .lbl    { animation: fadeUp 0.8s ease 1.4s both; }
          .vig    { animation: shimmer 3s ease-in-out infinite; }
        `}</style>

        <rect width="680" height="480" fill="#080808"/>
        <defs>
          <radialGradient id="vg" cx="50%" cy="50%" r="56%">
            <stop offset="0%" stopColor="#080808" stopOpacity="0"/>
            <stop offset="100%" stopColor="#000" stopOpacity="0.95"/>
          </radialGradient>
        </defs>
        <rect className="vig" width="680" height="480" fill="url(#vg)"/>

        {/* Raíces */}
        <path className="r" style={{"--len":420,"strokeDasharray":420,"animationDuration":"2.2s","animationDelay":"0.1s"} as React.CSSProperties} stroke="#6b4a22" strokeWidth="2.2" d="M318 162 C306 148 318 130 302 114 C286 98 262 100 248 80 C234 62 242 44 228 26 C216 10 198 6 182 -8"/>
        <path className="r" style={{"--len":180,"strokeDasharray":180,"animationDuration":"1.2s","animationDelay":"0.6s"} as React.CSSProperties} stroke="#4a3214" strokeWidth="1.5" d="M312 164 C298 158 284 148 268 142 C252 136 238 136 222 128"/>
        <path className="r" style={{"--len":300,"strokeDasharray":300,"animationDuration":"1.7s","animationDelay":"0.3s"} as React.CSSProperties} stroke="#5a3e1b" strokeWidth="2" d="M336 156 C330 136 342 116 334 94 C326 74 308 64 308 42 C308 22 320 10 314 -6"/>
        <path className="r" style={{"--len":110,"strokeDasharray":110,"animationDuration":"0.9s","animationDelay":"0.8s"} as React.CSSProperties} stroke="#3a2810" strokeWidth="1" d="M344 156 C348 140 340 126 350 112 C358 100 370 96 374 82"/>
        <path className="r" style={{"--len":400,"strokeDasharray":400,"animationDuration":"2.0s","animationDelay":"0.15s"} as React.CSSProperties} stroke="#6b4a22" strokeWidth="2.4" d="M362 160 C374 144 362 126 378 108 C394 90 418 88 430 66 C442 46 434 28 448 10 C460 -4 478 -8 490 -20"/>
        <path className="r" style={{"--len":260,"strokeDasharray":260,"animationDuration":"1.5s","animationDelay":"0.4s"} as React.CSSProperties} stroke="#5a3e1b" strokeWidth="1.6" d="M370 166 C386 156 400 162 416 150 C432 138 438 120 456 112 C472 104 490 108 506 98"/>
        <path className="r" style={{"--len":150,"strokeDasharray":150,"animationDuration":"1.0s","animationDelay":"0.7s"} as React.CSSProperties} stroke="#3a2810" strokeWidth="1" d="M366 162 C376 148 388 138 398 124 C406 112 408 100 418 90"/>
        <path className="r" style={{"--len":380,"strokeDasharray":380,"animationDuration":"2.0s","animationDelay":"0.2s"} as React.CSSProperties} stroke="#6b4a22" strokeWidth="2.3" d="M396 216 C418 208 428 220 450 210 C472 200 480 180 504 176 C526 172 540 184 564 178 C584 172 596 160 622 158"/>
        <path className="r" style={{"--len":200,"strokeDasharray":200,"animationDuration":"1.3s","animationDelay":"0.55s"} as React.CSSProperties} stroke="#4a3214" strokeWidth="1.4" d="M398 232 C420 230 436 240 456 236 C476 232 488 218 510 218 C530 218 546 228 568 226"/>
        <path className="r" style={{"--len":350,"strokeDasharray":350,"animationDuration":"1.9s","animationDelay":"0.3s"} as React.CSSProperties} stroke="#5a3e1b" strokeWidth="2" d="M396 248 C416 244 430 256 452 252 C474 248 486 234 510 234 C532 234 548 246 572 244 C594 242 610 232 640 232"/>
        <path className="r" style={{"--len":140,"strokeDasharray":140,"animationDuration":"1.0s","animationDelay":"0.75s"} as React.CSSProperties} stroke="#3a2810" strokeWidth="1" d="M394 262 C412 266 426 278 444 276 C460 274 472 262 490 264"/>
        <path className="r" style={{"--len":290,"strokeDasharray":290,"animationDuration":"1.7s","animationDelay":"0.4s"} as React.CSSProperties} stroke="#6b4a22" strokeWidth="1.8" d="M390 274 C408 282 418 298 438 296 C458 294 470 278 490 280 C510 282 524 296 548 298 C568 300 584 292 608 296"/>
        <path className="r" style={{"--len":380,"strokeDasharray":380,"animationDuration":"2.0s","animationDelay":"0.2s"} as React.CSSProperties} stroke="#6b4a22" strokeWidth="2.3" d="M284 216 C262 208 252 220 230 210 C208 200 200 180 176 176 C154 172 140 184 116 178 C96 172 84 160 58 158"/>
        <path className="r" style={{"--len":200,"strokeDasharray":200,"animationDuration":"1.3s","animationDelay":"0.55s"} as React.CSSProperties} stroke="#4a3214" strokeWidth="1.4" d="M282 232 C260 230 244 240 224 236 C204 232 192 218 170 218 C150 218 134 228 112 226"/>
        <path className="r" style={{"--len":350,"strokeDasharray":350,"animationDuration":"1.9s","animationDelay":"0.3s"} as React.CSSProperties} stroke="#5a3e1b" strokeWidth="2" d="M284 248 C264 244 250 256 228 252 C206 248 194 234 170 234 C148 234 132 246 108 244 C86 242 70 232 40 232"/>
        <path className="r" style={{"--len":140,"strokeDasharray":140,"animationDuration":"1.0s","animationDelay":"0.75s"} as React.CSSProperties} stroke="#3a2810" strokeWidth="1" d="M286 262 C268 266 254 278 236 276 C220 274 208 262 190 264"/>
        <path className="r" style={{"--len":290,"strokeDasharray":290,"animationDuration":"1.7s","animationDelay":"0.4s"} as React.CSSProperties} stroke="#6b4a22" strokeWidth="1.8" d="M290 274 C272 282 262 298 242 296 C222 294 210 278 190 280 C170 282 156 296 132 298 C112 300 96 292 72 296"/>
        <path className="r" style={{"--len":410,"strokeDasharray":410,"animationDuration":"2.1s","animationDelay":"0.1s"} as React.CSSProperties} stroke="#6b4a22" strokeWidth="2.2" d="M320 304 C308 320 320 340 304 358 C288 376 264 378 252 400 C240 420 248 440 234 460 C222 476 204 480 190 494"/>
        <path className="r" style={{"--len":160,"strokeDasharray":160,"animationDuration":"1.1s","animationDelay":"0.7s"} as React.CSSProperties} stroke="#3a2810" strokeWidth="1" d="M314 302 C302 318 288 330 274 348 C262 364 256 380 242 394"/>
        <path className="r" style={{"--len":280,"strokeDasharray":280,"animationDuration":"1.6s","animationDelay":"0.35s"} as React.CSSProperties} stroke="#5a3e1b" strokeWidth="1.8" d="M336 306 C330 328 342 350 332 372 C322 394 306 404 304 428 C302 448 314 462 308 480"/>
        <path className="r" style={{"--len":120,"strokeDasharray":120,"animationDuration":"0.9s","animationDelay":"0.85s"} as React.CSSProperties} stroke="#4a3214" strokeWidth="1.2" d="M344 306 C350 326 342 344 352 362 C360 378 374 384 376 400"/>
        <path className="r" style={{"--len":410,"strokeDasharray":410,"animationDuration":"2.1s","animationDelay":"0.15s"} as React.CSSProperties} stroke="#6b4a22" strokeWidth="2.2" d="M360 304 C372 320 360 340 376 358 C392 376 416 378 428 400 C440 420 432 440 446 460 C458 476 476 480 490 494"/>
        <path className="r" style={{"--len":240,"strokeDasharray":240,"animationDuration":"1.4s","animationDelay":"0.5s"} as React.CSSProperties} stroke="#4a3214" strokeWidth="1.5" d="M366 302 C378 318 392 334 404 352 C416 370 420 388 434 404 C448 420 464 428 474 446"/>
        <path className="r" style={{"--len":150,"strokeDasharray":150,"animationDuration":"1.0s","animationDelay":"0.8s"} as React.CSSProperties} stroke="#3a2810" strokeWidth="1" d="M370 304 C380 322 390 338 402 354 C412 368 418 382 428 396"/>
        <path className="r" style={{"--len":100,"strokeDasharray":100,"animationDuration":"0.8s","animationDelay":"1.1s"} as React.CSSProperties} stroke="#3a2810" strokeWidth="0.8" d="M248 80 C238 68 224 60 210 52"/>
        <path className="r" style={{"--len":90,"strokeDasharray":90,"animationDuration":"0.8s","animationDelay":"1.2s"} as React.CSSProperties} stroke="#3a2810" strokeWidth="0.8" d="M430 66 C440 52 448 38 458 26"/>
        <path className="r" style={{"--len":90,"strokeDasharray":90,"animationDuration":"0.8s","animationDelay":"1.15s"} as React.CSSProperties} stroke="#3a2810" strokeWidth="0.8" d="M504 176 C514 162 520 148 530 136"/>
        <path className="r" style={{"--len":90,"strokeDasharray":90,"animationDuration":"0.8s","animationDelay":"1.15s"} as React.CSSProperties} stroke="#3a2810" strokeWidth="0.8" d="M176 176 C166 162 160 148 150 136"/>
        <path className="r" style={{"--len":100,"strokeDasharray":100,"animationDuration":"0.8s","animationDelay":"1.1s"} as React.CSSProperties} stroke="#3a2810" strokeWidth="0.8" d="M252 400 C240 412 226 422 212 434"/>
        <path className="r" style={{"--len":100,"strokeDasharray":100,"animationDuration":"0.8s","animationDelay":"1.1s"} as React.CSSProperties} stroke="#3a2810" strokeWidth="0.8" d="M428 400 C440 412 454 422 468 434"/>

        {/* Reloj */}
        <circle cx="340" cy="230" r="82" fill="#1a1008" opacity="0.7"/>
        <circle cx="340" cy="230" r="78" fill="none" stroke="#6b4a22" strokeWidth="3"/>
        <circle cx="340" cy="230" r="74" fill="none" stroke="#4a3214" strokeWidth="0.8"/>
        <circle cx="340" cy="230" r="70" fill="#0d0d0d" stroke="#2a1f0a" strokeWidth="1.5"/>
        <circle cx="340" cy="230" r="65" fill="none" stroke="#3a2810" strokeWidth="0.8"/>
        <line x1="340" y1="164" x2="340" y2="176" stroke="#6b4a22" strokeWidth="2.5"/>
        <line x1="404" y1="230" x2="392" y2="230" stroke="#6b4a22" strokeWidth="2.5"/>
        <line x1="340" y1="296" x2="340" y2="284" stroke="#6b4a22" strokeWidth="2.5"/>
        <line x1="276" y1="230" x2="288" y2="230" stroke="#6b4a22" strokeWidth="2.5"/>
        <line x1="373" y1="167" x2="370" y2="177" stroke="#3a2810" strokeWidth="1.2"/>
        <line x1="397" y1="191" x2="388" y2="196" stroke="#3a2810" strokeWidth="1.2"/>
        <line x1="397" y1="269" x2="388" y2="264" stroke="#3a2810" strokeWidth="1.2"/>
        <line x1="373" y1="293" x2="370" y2="283" stroke="#3a2810" strokeWidth="1.2"/>
        <line x1="307" y1="167" x2="310" y2="177" stroke="#3a2810" strokeWidth="1.2"/>
        <line x1="283" y1="191" x2="292" y2="196" stroke="#3a2810" strokeWidth="1.2"/>
        <line x1="283" y1="269" x2="292" y2="264" stroke="#3a2810" strokeWidth="1.2"/>
        <line x1="307" y1="293" x2="310" y2="283" stroke="#3a2810" strokeWidth="1.2"/>
        <g className="hour-g">
          <line x1="340" y1="230" x2="340" y2="196" stroke="#8a6535" strokeWidth="4" strokeLinecap="round"/>
          <polygon points="340,192 337,206 343,206" fill="#8a6535"/>
        </g>
        <g className="min-g">
          <line x1="340" y1="230" x2="340" y2="180" stroke="#a07840" strokeWidth="2.5" strokeLinecap="round"/>
          <polygon points="340,176 338,192 342,192" fill="#a07840"/>
        </g>
        <line x1="340" y1="230" x2="358" y2="252" stroke="#6b4a22" strokeWidth="1" strokeLinecap="round" opacity="0.6"/>
        <circle className="cdot" cx="340" cy="230" r="5" fill="#6b4a22"/>
        <circle cx="340" cy="230" r="2.5" fill="#a07840"/>
        <text className="lbl" x="340" y="442" textAnchor="middle"
          fontFamily="Georgia, serif" fontSize="22" fill="#8a6535" letterSpacing="6">RIZOMA</text>
      </svg>
    </div>
  );
}