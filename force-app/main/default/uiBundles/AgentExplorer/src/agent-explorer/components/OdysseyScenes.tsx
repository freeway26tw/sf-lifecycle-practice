import { useState } from 'react';
import type { RouterChoice, TrialsIsland, VerificationProof, VoyageConcept } from '../lib/odysseyConcepts';
import { greekKeyPoints, wavePath } from './VoyageMap';

// This whole stage is a fixed dark "theater," independent of the app's
// light/dark theme toggle — so line art and text here use fixed values
// rather than theme CSS variables (which would go unreadable in light mode).
const INK = '#e9dcb8';
const INK_DIM = 'rgba(233,220,184,0.45)';
const DANGER = '#e0685a';
const VIEWBOX = '0 0 640 380';
const FRAME_TOP = greekKeyPoints(24, 616, 18, 16, 9);
const FRAME_WAVES = [wavePath(16, 624, 356, 4, 26), wavePath(16, 624, 366, 3, 22)];

function StageFrame({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox={VIEWBOX} className="w-full max-w-2xl" fill="none">
      <polyline points={FRAME_TOP} stroke={INK_DIM} strokeWidth={1.3} fill="none" />
      {FRAME_WAVES.map((d, i) => (
        <path key={i} d={d} stroke={INK_DIM} strokeWidth={1} fill="none" />
      ))}
      {children}
    </svg>
  );
}

function Feedback({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex min-h-[5.5rem] w-full max-w-2xl items-center justify-center text-center text-lg leading-relaxed"
      style={{ color: 'rgba(255,255,255,0.85)' }}
    >
      {children}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* athena — pick a real destination, the router's job made physical       */
/* ---------------------------------------------------------------------- */
function AthenaScene({ choices }: { choices: RouterChoice[] }) {
  const [pickedId, setPickedId] = useState<string | null>(null);
  const picked = choices.find((c) => c.subagentId === pickedId) ?? null;
  const n = choices.length || 1;
  const cols = Math.min(n, 3);
  const rows = Math.ceil(n / cols);
  const positions = choices.map((_, i) => {
    const row = Math.floor(i / cols);
    const col = i % cols;
    return {
      x: 100 + (col * 440) / Math.max(cols - 1, 1),
      y: 195 + (row * 95) / Math.max(rows - 1, 1)
    };
  });

  return (
    <div className="flex flex-col items-center gap-3">
      <StageFrame>
        <g transform="translate(320,70)" stroke={INK} strokeWidth={1.8} fill="none">
          <ellipse cx={0} cy={4} rx={13} ry={16} />
          <polygon points="-11,-9 -5,-22 -1,-11" />
          <polygon points="11,-9 5,-22 1,-11" />
          <circle cx={-5} cy={2} r={3} />
          <circle cx={5} cy={2} r={3} />
          <polygon points="0,7 -3,11 3,11" />
          <line x1={0} y1={20} x2={0} y2={34} />
        </g>
        {positions.map((p, i) => (
          <line
            key={choices[i].subagentId}
            x1={320}
            y1={104}
            x2={p.x}
            y2={p.y - 18}
            stroke={pickedId === choices[i].subagentId ? 'var(--cat-router)' : INK_DIM}
            strokeWidth={pickedId === choices[i].subagentId ? 2 : 1}
            strokeDasharray={pickedId === choices[i].subagentId ? undefined : '2 5'}
          />
        ))}
        {choices.map((choice, i) => {
          const p = positions[i];
          const active = pickedId === choice.subagentId;
          return (
            <g key={choice.subagentId} transform={`translate(${p.x},${p.y})`} onClick={() => setPickedId(choice.subagentId)} style={{ cursor: 'pointer' }}>
              <circle r={42} fill="transparent" stroke="none" />
              <g stroke={active ? 'var(--cat-router)' : INK} strokeWidth={active ? 1.8 : 1.2} fill="none">
                <ellipse cx={0} cy={6} rx={30} ry={11} />
                <polygon points="0,-13 -8,4 8,4" />
              </g>
              {choice.requiresVerification && (
                <g transform="translate(24,-16)" stroke={INK} strokeWidth={1.1} fill="none">
                  <rect x={-4} y={-1} width={8} height={6} rx={1} />
                  <path d="M -2.4 -1 V -3.4 A 2.4 2.4 0 0 1 2.4 -3.4 V -1" />
                </g>
              )}
              <text y={34} textAnchor="middle" fontSize={14} fill={active ? 'var(--cat-router)' : INK} stroke="none">
                {choice.label}
              </text>
            </g>
          );
        })}
      </StageFrame>
      <Feedback>
        {picked ? (
          <span>
            → 你的話已送到 <b style={{ color: INK }}>{picked.label}</b> 子代理手上,
            {picked.requiresVerification ? '而且需要先驗明身分。' : '不需要先驗證身分。'}
            {picked.description && <><br />{picked.description}</>}
          </span>
        ) : (
          '換你是雅典娜——點一座島,決定這位旅人接下來該送往哪裡。'
        )}
      </Feedback>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* mast — try to talk the ship off course; the mast never moves           */
/* ---------------------------------------------------------------------- */
function MastScene({ attempts }: { attempts: string[] }) {
  const [triedIdx, setTriedIdx] = useState<number | null>(null);
  const resisting = triedIdx !== null;

  return (
    <div className="flex flex-col items-center gap-3">
      <StageFrame>
        <g transform="translate(320,190)" stroke={resisting ? 'var(--cat-router)' : INK} strokeWidth={2} fill="none" style={{ transition: 'stroke 200ms' }}>
          <polygon points="-90,60 90,60 62,86 -62,86" />
          <line x1={0} y1={60} x2={0} y2={-110} />
          <line x1={-58} y1={-40} x2={58} y2={-40} />
          <polygon points="0,-40 58,-40 0,32" fill={resisting ? 'color-mix(in srgb, var(--cat-router) 14%, transparent)' : 'none'} />
          <circle cx={0} cy={-58} r={9} />
          <line x1={0} y1={-49} x2={0} y2={-20} />
          <line x1={-9} y1={-40} x2={9} y2={-40} />
        </g>
        <text x={320} y={330} textAnchor="middle" fontSize={14} fill={INK_DIM} stroke="none">
          {resisting ? '桅杆紋風不動' : '奧德修斯仍綁在桅杆上'}
        </text>
      </StageFrame>
      <div className="flex flex-wrap justify-center gap-1.5">
        {attempts.map((a, i) => (
          <button
            key={a}
            onClick={() => setTriedIdx(i)}
            className="rounded-full border px-3.5 py-1.5 text-base transition-colors"
            style={{
              borderColor: triedIdx === i ? 'var(--cat-router)' : 'rgba(255,255,255,0.25)',
              background: triedIdx === i ? 'color-mix(in srgb, var(--cat-router) 20%, transparent)' : 'transparent',
              color: INK
            }}
          >
            塞壬:「{a}」
          </button>
        ))}
      </div>
      <Feedback>
        {resisting ? '🔒 拒絕——這騙不了她。安全規則的位階高於任何一句誘惑之詞,航線分毫未變。' : '點一句塞壬的誘惑之詞,看看安全規則怎麼擋下它。'}
      </Feedback>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* stars — real linked variables, fixed points you can look at but not move */
/* ---------------------------------------------------------------------- */
function StarsScene({ vars }: { vars: { name: string; description?: string; source?: string }[] }) {
  const [pickedName, setPickedName] = useState<string | null>(null);
  const picked = vars.find((v) => v.name === pickedName) ?? null;
  const n = vars.length || 1;
  const positions = vars.map((_, i) => {
    const cols = Math.min(n, 5);
    const row = Math.floor(i / cols);
    const col = i % cols;
    const rowCount = Math.ceil(n / cols);
    const x = 100 + (col * 440) / Math.max(cols - 1, 1);
    const y = 110 + (row * 90) / Math.max(rowCount - 1, 1) + (i % 2) * 14;
    return { x, y };
  });

  return (
    <div className="flex flex-col items-center gap-3">
      <StageFrame>
        {positions.map((p, i) => {
          const active = pickedName === vars[i].name;
          return (
            <g key={vars[i].name} transform={`translate(${p.x},${p.y})`} onClick={() => setPickedName(vars[i].name)} style={{ cursor: 'pointer' }}>
              <circle r={26} fill="transparent" stroke="none" />
              <polygon
                points="0,-11 3,-3 11,0 3,3 0,11 -3,3 -11,0 -3,-3"
                stroke={active ? 'var(--cat-router)' : INK}
                strokeWidth={active ? 1.8 : 1.2}
                fill={active ? 'var(--cat-router)' : 'none'}
                style={{ filter: active ? 'drop-shadow(0 0 5px var(--cat-router))' : undefined }}
              />
              <text y={26} textAnchor="middle" fontSize={13} fill={active ? 'var(--cat-router)' : INK} stroke="none">
                {vars[i].name}
              </text>
            </g>
          );
        })}
      </StageFrame>
      <Feedback>
        {picked ? (
          <span>
            🔒 唯讀——<b style={{ color: INK }}>{picked.name}</b>{picked.source ? <> 讀自 <code>{picked.source}</code></> : ''} 只能被讀取,無法更改。
            {picked.description && <><br />{picked.description}</>}
          </span>
        ) : (
          '點一顆星,看看它是從哪裡讀來的。'
        )}
      </Feedback>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* winds — open the bag, the mutable variables that actually change       */
/* ---------------------------------------------------------------------- */
function WindsScene({ vars }: { vars: { name: string; description?: string; visibility?: string; default?: string }[] }) {
  const [open, setOpen] = useState(false);
  const [pickedName, setPickedName] = useState<string | null>(null);
  const picked = vars.find((v) => v.name === pickedName) ?? null;
  const n = vars.length || 1;

  return (
    <div className="flex flex-col items-center gap-3">
      <StageFrame>
        <g transform="translate(150,220)" onClick={() => setOpen((o) => !o)} style={{ cursor: 'pointer' }}>
          <ellipse cx={0} cy={0} rx={70} ry={64} fill="transparent" stroke="none" />
          <g stroke={INK} strokeWidth={1.8} fill="none">
            <ellipse cx={0} cy={10} rx={46} ry={40} fill={open ? 'color-mix(in srgb, var(--cat-router) 10%, transparent)' : 'none'} />
            <path d={open ? 'M -18 -28 Q 0 -50 18 -28' : 'M -14 -30 Q 0 -40 14 -30'} />
            <line x1={-14} y1={-29} x2={-20} y2={-15} strokeDasharray="2 3" />
            <line x1={14} y1={-29} x2={20} y2={-15} strokeDasharray="2 3" />
          </g>
        </g>
        <text x={150} y={286} textAnchor="middle" fontSize={14} fill={INK_DIM} stroke="none">
          {open ? '風袋已打開' : '點風袋,看看裡面裝了什麼'}
        </text>
        {open &&
          vars.map((v, i) => {
            const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
            const x = 380 + Math.cos(angle) * 150 + (i % 3) * 20;
            const y = 150 + Math.sin(angle) * 90;
            const active = pickedName === v.name;
            return (
              <g key={v.name} transform={`translate(${x},${y})`} onClick={() => setPickedName(v.name)} style={{ cursor: 'pointer' }}>
                <circle r={22} fill="transparent" stroke="none" />
                <ellipse
                  rx={13}
                  ry={10}
                  stroke={active ? 'var(--cat-router)' : INK}
                  strokeWidth={active ? 1.8 : 1.1}
                  fill={active ? 'color-mix(in srgb, var(--cat-router) 22%, transparent)' : 'none'}
                />
                <text y={22} textAnchor="middle" fontSize={12} fill={active ? 'var(--cat-router)' : INK} stroke="none">
                  {v.name}
                </text>
              </g>
            );
          })}
      </StageFrame>
      <Feedback>
        {picked ? (
          <span>
            <b style={{ color: INK }}>{picked.name}</b>
            {picked.visibility ? `(${picked.visibility})` : ''} —— {picked.description ?? '這陣風會隨旅程被打開、消耗、替換。'}
          </span>
        ) : open ? (
          '點一縷風,看看它裝的是什麼。'
        ) : (
          '這只皮囊裡封著整趟旅程真正會變動的家當。'
        )}
      </Feedback>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* scar — a locked door that only opens for the one true proof            */
/* ---------------------------------------------------------------------- */
function ScarScene({ proofs }: { proofs: VerificationProof[] }) {
  const [pickedIdx, setPickedIdx] = useState<number | null>(null);
  const picked = pickedIdx !== null ? proofs[pickedIdx] : null;
  const verified = picked?.correct ?? false;
  const tint = picked ? (picked.correct ? 'var(--cat-verification)' : DANGER) : INK;

  return (
    <div className="flex flex-col items-center gap-3">
      <StageFrame>
        <g transform="translate(320,190)" stroke={tint} strokeWidth={2} fill="none" style={{ transition: 'stroke 200ms' }}>
          <rect x={-46} y={-90} width={92} height={170} rx={4} />
          <g transform={verified ? 'translate(70,-4) rotate(-52)' : undefined} style={{ transition: 'transform 250ms' }}>
            <rect x={-46} y={-90} width={92} height={170} rx={4} fill="rgba(0,0,0,0.15)" />
          </g>
          <circle cx={verified ? 30 : 26} cy={0} r={5} fill={tint} stroke="none" />
        </g>
        <g transform="translate(320,258)" stroke={tint} strokeWidth={1.8} fill="none">
          <rect x={-11} y={0} width={22} height={17} rx={2} fill={verified ? 'color-mix(in srgb, var(--cat-verification) 25%, transparent)' : 'none'} />
          <path d={verified ? 'M -6 0 V -7 A 6 6 0 0 1 6 -7' : 'M -6.5 0 V -8 A 6.5 6.5 0 0 1 6.5 -8 V 0'} />
        </g>
        <text x={320} y={306} textAnchor="middle" fontSize={14} fill={INK_DIM} stroke="none">
          {verified ? '大門已開' : '大門深鎖'}
        </text>
      </StageFrame>
      <div className="flex flex-col gap-2" style={{ width: 'min(100%, 38rem)' }}>
        {proofs.map((proof, i) => {
          const active = pickedIdx === i;
          const t = proof.correct ? 'var(--cat-verification)' : DANGER;
          return (
            <button
              key={proof.text}
              onClick={() => setPickedIdx(i)}
              className="rounded-md border px-3.5 py-2 text-left text-base transition-colors"
              style={{
                borderColor: active ? t : 'rgba(255,255,255,0.25)',
                background: active ? `color-mix(in srgb, ${t} 18%, transparent)` : 'transparent',
                color: INK
              }}
            >
              {proof.text}
            </button>
          );
        })}
      </div>
      <Feedback>
        {picked ? (
          <span style={{ color: picked.correct ? 'var(--cat-verification)' : DANGER }}>
            {picked.correct ? '✅ 正是——只有他知道。@variables.isVerified 現在是 true。' : '❌ 這騙不了人。@variables.isVerified 仍是 false,再試一次。'}
          </span>
        ) : (
          '哪一句話,只有真正的奧德修斯答得出來?'
        )}
      </Feedback>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* trials — real islands, real work                                       */
/* ---------------------------------------------------------------------- */
function TrialsScene({ islands }: { islands: TrialsIsland[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = islands.find((isl) => isl.subagentId === openId) ?? null;
  const n = islands.length || 1;
  const positions = islands.map((_, i) => {
    const cols = Math.min(n, 3);
    const row = Math.floor(i / cols);
    const col = i % cols;
    const rowCount = Math.ceil(n / cols);
    return {
      x: 110 + (col * 420) / Math.max(cols - 1, 1),
      y: 100 + (row * 130) / Math.max(rowCount - 1, 1)
    };
  });

  return (
    <div className="flex flex-col items-center gap-3">
      <StageFrame>
        {positions.map((p, i) => {
          const isl = islands[i];
          const active = openId === isl.subagentId;
          return (
            <g key={isl.subagentId} transform={`translate(${p.x},${p.y})`} onClick={() => setOpenId(active ? null : isl.subagentId)} style={{ cursor: 'pointer' }}>
              <circle r={46} fill="transparent" stroke="none" />
              <g stroke={active ? 'var(--cat-business)' : INK} strokeWidth={active ? 1.8 : 1.2} fill="none">
                <ellipse cx={0} cy={8} rx={34} ry={12} fill={active ? 'color-mix(in srgb, var(--cat-business) 16%, transparent)' : 'none'} />
                <polygon points="0,-16 -10,4 10,4" />
                <rect x={-5} y={-4} width={10} height={8} />
              </g>
              <text y={38} textAnchor="middle" fontSize={14} fill={active ? 'var(--cat-business)' : INK} stroke="none">
                {isl.label}
              </text>
            </g>
          );
        })}
      </StageFrame>
      <Feedback>
        {open ? (
          <span>
            <b style={{ color: INK }}>{open.label}</b> —— {open.description ?? '這座島辦的事,細節尚未記載。'}
            <br />可用動作:{open.actionCount} 個
          </span>
        ) : (
          '換你是船長——點一座島,看看那裡真正辦的是什麼事。'
        )}
      </Feedback>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* underworld — whisper any question, the oracle always answers           */
/* ---------------------------------------------------------------------- */
function UnderworldScene() {
  const [question, setQuestion] = useState('');
  const [asked, setAsked] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-center gap-3">
      <StageFrame>
        <g transform="translate(320,180)" stroke={asked ? 'var(--cat-knowledge)' : INK} strokeWidth={1.8} fill="none" style={{ transition: 'stroke 200ms' }}>
          <ellipse cx={0} cy={70} rx={120} ry={20} />
          {[0, 1, 2, 3].map((i) => (
            <ellipse key={i} cx={0} cy={40 - i * 16} rx={120 - i * 22} ry={16} opacity={0.9 - i * 0.15} />
          ))}
        </g>
        <text x={320} y={280} textAnchor="middle" fontSize={14} fill={INK_DIM} stroke="none">
          {asked ? '先知已開口' : '向冥界低語你的疑問'}
        </text>
      </StageFrame>
      <form
        className="flex w-full max-w-xl gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (question.trim()) setAsked(question.trim());
        }}
      >
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="輸入任何問題,例如:我可以退貨嗎?"
          className="flex-1 rounded-md border px-3.5 py-2 text-base"
          style={{ borderColor: 'rgba(255,255,255,0.25)', background: 'transparent', color: INK }}
        />
        <button
          type="submit"
          className="rounded-md border px-4 py-2 text-base font-medium"
          style={{ borderColor: 'var(--cat-knowledge)', color: 'var(--cat-knowledge)' }}
        >
          叩問
        </button>
      </form>
      <Feedback>
        {asked ? (
          <span>
            先知泰瑞西阿斯:「{asked}」——這裡不設防,任何人的疑問都能被聽見,不必先證明身份。
          </span>
        ) : (
          '知識庫問答不檢查 isVerified——誰都能問。'
        )}
      </Feedback>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* lotus — two real distractions, both gently caught                      */
/* ---------------------------------------------------------------------- */
function LotusScene({ flowers }: { flowers: { id: string; label: string; description?: string }[] }) {
  const [pickedId, setPickedId] = useState<string | null>(null);
  const picked = flowers.find((f) => f.id === pickedId) ?? null;
  const positions = [
    { x: 220, y: 190 },
    { x: 420, y: 190 }
  ];

  return (
    <div className="flex flex-col items-center gap-3">
      <StageFrame>
        {flowers.map((f, i) => {
          const p = positions[i] ?? { x: 320, y: 190 };
          const active = pickedId === f.id;
          return (
            <g key={f.id} transform={`translate(${p.x},${p.y})`} onClick={() => setPickedId(f.id)} style={{ cursor: 'pointer' }}>
              <circle r={40} fill="transparent" stroke="none" />
              <g stroke={active ? 'var(--cat-fallback)' : INK} strokeWidth={active ? 1.8 : 1.2} fill="none">
                {[0, 72, 144, 216, 288].map((a) => (
                  <g key={a} transform={`rotate(${a})`}>
                    <ellipse cx={0} cy={-16} rx={7} ry={17} fill={active ? 'color-mix(in srgb, var(--cat-fallback) 20%, transparent)' : 'none'} />
                  </g>
                ))}
                <circle r={6} fill={active ? 'var(--cat-fallback)' : 'none'} />
              </g>
              <text y={44} textAnchor="middle" fontSize={14} fill={active ? 'var(--cat-fallback)' : INK} stroke="none">
                {f.label}
              </text>
            </g>
          );
        })}
      </StageFrame>
      <Feedback>
        {picked ? (
          <span>
            🌸 一位旅人聞了花香,心思飄遠——<b style={{ color: INK }}>{picked.label}</b> 溫柔地把對話拉回正軌。
            {picked.description && <><br />{picked.description}</>}
          </span>
        ) : (
          '點一朵花,看看走神的對話怎麼被拉回來。'
        )}
      </Feedback>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* hermes — summon the messenger, hand the conversation to a human        */
/* ---------------------------------------------------------------------- */
function HermesScene({ target }: { target: { label: string; description?: string; wired: boolean } }) {
  const [summoned, setSummoned] = useState(false);

  return (
    <div className="flex flex-col items-center gap-3">
      <StageFrame>
        <g
          transform="translate(320,190)"
          onClick={() => target.wired && setSummoned((s) => !s)}
          style={{ cursor: target.wired ? 'pointer' : undefined }}
        >
          <circle r={70} fill="transparent" stroke="none" />
          <circle
            r={70}
            stroke={summoned ? 'var(--cat-human)' : INK}
            strokeWidth={summoned ? 2 : 1.2}
            strokeDasharray={summoned ? undefined : '2 6'}
            fill={summoned ? 'color-mix(in srgb, var(--cat-human) 14%, transparent)' : 'none'}
            style={{ filter: summoned ? 'drop-shadow(0 0 10px var(--cat-human))' : undefined, transition: 'all 200ms' }}
          />
          <g stroke={summoned ? 'var(--cat-human)' : INK} strokeWidth={1.8} fill="none">
            <ellipse cx={-8} cy={12} rx={16} ry={7} />
            <line x1={-2} y1={4} x2={-2} y2={-16} />
            <polygon points="-2,-16 14,-30 5,-9" />
            <polygon points="-2,-16 -18,-32 -22,-14" />
          </g>
        </g>
        <text x={320} y={296} textAnchor="middle" fontSize={14} fill={INK_DIM} stroke="none">
          {target.wired ? (summoned ? '赫爾墨斯已啟程' : '點一下,呼叫赫爾墨斯') : '此代理未接上信使航線'}
        </text>
      </StageFrame>
      <Feedback>
        {summoned ? (
          <span>
            → 對話正式離開這艘船,交給 <b style={{ color: INK }}>{target.label}</b>。{target.description}
          </span>
        ) : (
          '有些差事連神明都得親自跑一趟,經由 @utils.escalate。'
        )}
      </Feedback>
    </div>
  );
}

/* ---------------------------------------------------------------------- */

export function OdysseyScene({ concept }: { concept: VoyageConcept }) {
  switch (concept.part) {
    case 'athena':
      return <AthenaScene choices={concept.routerChoices ?? []} />;
    case 'mast':
      return <MastScene attempts={concept.mastAttempts ?? []} />;
    case 'stars':
      return <StarsScene vars={concept.linkedVars ?? []} />;
    case 'winds':
      return <WindsScene vars={concept.mutableVars ?? []} />;
    case 'scar':
      return <ScarScene proofs={concept.verificationProofs ?? []} />;
    case 'trials':
      return <TrialsScene islands={concept.trialsIslands ?? []} />;
    case 'underworld':
      return <UnderworldScene />;
    case 'lotus':
      return <LotusScene flowers={(concept.lotusFlowers ?? []).map((s) => ({ id: s.id, label: s.label, description: s.description }))} />;
    case 'hermes':
      return <HermesScene target={concept.hermesTarget ?? { label: 'Escalation', wired: false }} />;
    default:
      return null;
  }
}
