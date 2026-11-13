import { useCallback, useEffect, useMemo, useState } from 'react';
import './theme.css';
import rawDoc from './data/agent.generated.json';
import type { AgentDoc } from './types';
import { HUMAN_NODE_ID } from './lib/palette';
import { buildPresenterSteps } from './lib/presenter';
import { buildVoyageConcepts } from './lib/odysseyConcepts';
import { FlowDiagram } from './components/FlowDiagram';
import { DetailPanel } from './components/DetailPanel';
import { VariablesPanel } from './components/VariablesPanel';
import { OverviewPanel } from './components/OverviewPanel';
import { PresenterBar } from './components/PresenterBar';
import { OdysseyView } from './components/OdysseyView';
import { ChartFrame } from './components/ChartFrame';
import { StoryMode } from './components/StoryMode';

const doc = rawDoc as unknown as AgentDoc;
const presenterSteps = buildPresenterSteps(doc);
const voyageConcepts = buildVoyageConcepts(doc);

type Tab = 'odyssey' | 'chart' | 'variables' | 'overview';
type ThemePref = 'system' | 'light' | 'dark';

function useThemePref() {
  const [pref, setPref] = useState<ThemePref>(
    () => (localStorage.getItem('agent-explorer-theme') as ThemePref | null) ?? 'system'
  );
  useEffect(() => {
    if (pref === 'system') delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = pref;
    localStorage.setItem('agent-explorer-theme', pref);
  }, [pref]);
  return [pref, setPref] as const;
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'odyssey', label: '奧德賽之旅' },
  { id: 'chart', label: '架構圖' },
  { id: 'variables', label: '變數' },
  { id: 'overview', label: '總覽' }
];

function TabButton({
  active,
  onClick,
  children
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
      style={{
        background: active ? 'var(--surface-1)' : 'transparent',
        color: active ? 'var(--text-primary)' : 'var(--text-secondary)'
      }}
    >
      {children}
    </button>
  );
}

function SidePanel({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <aside
      className="w-[420px] shrink-0 overflow-y-auto border-l p-5"
      style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}
    >
      <button onClick={onClose} className="mb-3 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
        ✕ Close
      </button>
      {children}
    </aside>
  );
}

export default function AgentExplorerApp() {
  const [tab, setTab] = useState<Tab>('odyssey');
  const [selectedId, setSelectedId] = useState<string | null>(
    () => doc.subagents.find((s) => s.isEntry)?.id ?? null
  );
  const [themePref, setThemePref] = useThemePref();
  const [presenting, setPresenting] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [storyMode, setStoryMode] = useState(true);
  const [storyIndex, setStoryIndex] = useState(0);

  const selectedSubagent = useMemo(
    () => doc.subagents.find((s) => s.id === selectedId) ?? null,
    [selectedId]
  );

  const goToStep = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(presenterSteps.length - 1, index));
    setStepIndex(clamped);
    setSelectedId(presenterSteps[clamped].id);
  }, []);

  const startPresenting = useCallback(() => {
    setTab('chart');
    setPresenting(true);
    goToStep(0);
  }, [goToStep]);

  const exitPresenting = useCallback(() => setPresenting(false), []);

  const goToStoryStep = useCallback((index: number) => {
    setStoryIndex(Math.max(0, Math.min(voyageConcepts.length - 1, index)));
  }, []);

  // Re-entering the story (e.g. from the map overview) resumes at the
  // current chapter rather than jumping back to the beginning.
  const startStory = useCallback(() => {
    setTab('odyssey');
    setStoryMode(true);
  }, []);

  const exitStory = useCallback(() => setStoryMode(false), []);

  // Clicking a node while presenting should re-sync the step counter/caption
  // instead of drifting out of step with Prev/Next.
  const handleSelect = useCallback(
    (id: string) => {
      if (presenting) {
        const idx = presenterSteps.findIndex((s) => s.id === id);
        if (idx >= 0) {
          setStepIndex(idx);
          setSelectedId(id);
          return;
        }
      }
      setSelectedId(id);
    },
    [presenting]
  );

  useEffect(() => {
    if (!presenting) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goToStep(stepIndex + 1);
      else if (e.key === 'ArrowLeft') goToStep(stepIndex - 1);
      else if (e.key === 'Escape') exitPresenting();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [presenting, stepIndex, goToStep, exitPresenting]);

  useEffect(() => {
    if (!storyMode) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goToStoryStep(storyIndex + 1);
      else if (e.key === 'ArrowLeft') goToStoryStep(storyIndex - 1);
      else if (e.key === 'Escape') exitStory();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [storyMode, storyIndex, goToStoryStep, exitStory]);

  return (
    <div className="flex h-full flex-col" style={{ background: 'var(--page)' }}>
      <header
        className="flex shrink-0 items-center justify-between border-b px-4 py-2.5"
        style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}
      >
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            {doc.config.agent_label ?? 'Agent'} Explorer
          </h1>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {presenting
              ? '簡報模式:逐步說明架構'
              : storyMode
                ? '閱讀奧德賽之旅,一章接著一章'
                : 'Agentforce 代理程式腳本,以視覺化呈現'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {!presenting && !storyMode && (
            <>
              <nav className="flex gap-1 rounded-lg p-1" style={{ background: 'var(--page)' }}>
                {TABS.map((t) => (
                  <TabButton key={t.id} active={tab === t.id} onClick={() => setTab(t.id)}>
                    {t.label}
                  </TabButton>
                ))}
              </nav>
              <select
                value={themePref}
                onChange={(e) => setThemePref(e.target.value as ThemePref)}
                className="rounded-md border px-2 py-1 text-xs"
                style={{
                  borderColor: 'var(--border)',
                  background: 'var(--surface-2)',
                  color: 'var(--text-secondary)'
                }}
              >
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </>
          )}
          {tab === 'odyssey' ? (
            <button
              onClick={storyMode ? exitStory : startStory}
              className="rounded-md px-3 py-1.5 text-xs font-semibold transition-colors"
              style={{
                background: storyMode ? 'var(--surface-2)' : 'var(--cat-router)',
                color: storyMode ? 'var(--text-secondary)' : 'white',
                border: storyMode ? '1px solid var(--border)' : 'none'
              }}
            >
              {storyMode ? '🗺 查看航海全圖(Esc)' : '▶ 回到故事'}
            </button>
          ) : (
            <button
              onClick={presenting ? exitPresenting : startPresenting}
              className="rounded-md px-3 py-1.5 text-xs font-semibold transition-colors"
              style={{
                background: presenting ? 'var(--surface-2)' : 'var(--cat-router)',
                color: presenting ? 'var(--text-secondary)' : 'white',
                border: presenting ? '1px solid var(--border)' : 'none'
              }}
            >
              {presenting ? '退出簡報(Esc)' : '▶ 開始簡報'}
            </button>
          )}
        </div>
      </header>

      <main className="min-h-0 flex-1">
        {tab === 'odyssey' && (
          <div className="h-full">
            {storyMode ? (
              <StoryMode concepts={voyageConcepts} index={storyIndex} onPrev={() => goToStoryStep(storyIndex - 1)} onNext={() => goToStoryStep(storyIndex + 1)} onJump={goToStoryStep} />
            ) : (
              <OdysseyView doc={doc} />
            )}
          </div>
        )}
        {tab === 'chart' && (
          <div className="flex h-full">
            <div className="relative min-w-0 flex-1">
              <ChartFrame>
                <FlowDiagram doc={doc} selectedId={selectedId} onSelect={handleSelect} presenting={presenting} />
              </ChartFrame>
              {presenting && (
                <PresenterBar
                  steps={presenterSteps}
                  index={stepIndex}
                  onPrev={() => goToStep(stepIndex - 1)}
                  onNext={() => goToStep(stepIndex + 1)}
                  onExit={exitPresenting}
                  onJump={goToStep}
                />
              )}
            </div>
            {selectedSubagent && (
              <SidePanel onClose={() => setSelectedId(null)}>
                <DetailPanel subagent={selectedSubagent} />
              </SidePanel>
            )}
            {selectedId === HUMAN_NODE_ID && (
              <SidePanel onClose={() => setSelectedId(null)}>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  這不是一個子代理——而是對話完全離開 Agentforce,透過 <code>@utils.escalate</code>{' '}
                  動作交給真人客服的地方。
                </p>
              </SidePanel>
            )}
          </div>
        )}
        {tab === 'variables' && (
          <div className="h-full overflow-y-auto">
            <VariablesPanel variables={doc.variables} />
          </div>
        )}
        {tab === 'overview' && (
          <div className="h-full overflow-y-auto">
            <OverviewPanel doc={doc} />
          </div>
        )}
      </main>
    </div>
  );
}
