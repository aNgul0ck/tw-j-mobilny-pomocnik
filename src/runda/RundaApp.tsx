import { useState, useRef, useLayoutEffect } from 'react';
import {
  C, ACTIVITY_TYPE_LABELS, ACTIVITY_TYPE_ICONS, ACTIVITY_TYPE_COLORS,
  PLACE_TYPE_COLORS, getInitials,
} from './theme';
import {
  me, friends, activities, pendingRequests,
  Activity, FriendWithStatus,
} from './mock';

const FONT = "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif";

const GLASS: React.CSSProperties = {
  background: C.surface,
  backdropFilter: 'blur(28px) saturate(180%)',
  WebkitBackdropFilter: 'blur(28px) saturate(180%)',
  border: `0.5px solid ${C.border}`,
};

type Tab = 'map' | 'feed' | 'friends' | 'profile';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'map', label: 'Osoby', icon: '◈' },
  { key: 'feed', label: 'Aktywności', icon: '◉' },
  { key: 'friends', label: 'Znajomi', icon: '◎' },
  { key: 'profile', label: 'Ja', icon: '◇' },
];

const SHEET_TITLE: Record<Tab, string> = {
  map: 'Osoby',
  feed: 'Aktywności',
  friends: 'Znajomi',
  profile: 'Ja',
};

// ── UI primitives ──────────────────────────────────────────────
function Avatar({ initials, color, size = 40, online }: { initials: string; color: string; size?: number; online?: boolean }) {
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <div style={{
        width: size, height: size, borderRadius: size / 2, background: color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontWeight: 700, fontSize: size * 0.38,
        boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.18)',
      }}>{initials}</div>
      {online && (
        <div style={{
          position: 'absolute', bottom: 0, right: 0, width: size * 0.28, height: size * 0.28,
          borderRadius: size, background: C.accent, border: '2px solid #0E1512',
        }} />
      )}
    </div>
  );
}

function SmallButton({ children, onClick, variant = 'plain' }: { children: React.ReactNode; onClick?: () => void; variant?: 'green' | 'danger' | 'plain' }) {
  const styles = {
    green: { background: C.accentBg, color: C.accentLight, border: `0.5px solid ${C.accentBorder}` },
    danger: { background: C.dangerBg, color: C.danger, border: `0.5px solid ${C.dangerBorder}` },
    plain: { background: 'rgba(255,255,255,0.10)', color: C.text, border: `0.5px solid ${C.border}` },
  }[variant];
  return (
    <button onClick={onClick} style={{
      ...styles, padding: '8px 15px', borderRadius: 999, fontWeight: 600, fontSize: 13,
      cursor: 'pointer', fontFamily: FONT, whiteSpace: 'nowrap',
      backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
    }}>{children}</button>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ ...GLASS, borderRadius: 20, overflow: 'hidden', ...style }}>{children}</div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 600, color: C.textTert, letterSpacing: 0.8,
      textTransform: 'uppercase', margin: '18px 6px 8px',
    }}>{children}</div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} style={{
      width: 50, height: 30, borderRadius: 999, border: 'none', cursor: 'pointer', padding: 2,
      background: on ? C.accent : 'rgba(255,255,255,0.18)',
      display: 'flex', justifyContent: on ? 'flex-end' : 'flex-start',
      transition: 'background .2s', flexShrink: 0,
    }}>
      <span style={{
        width: 26, height: 26, borderRadius: 13, background: '#fff',
        boxShadow: '0 2px 6px rgba(0,0,0,0.3)', transition: 'all .2s',
      }} />
    </button>
  );
}

function Row({ label, value, accent, divider = true }: { label: React.ReactNode; value?: React.ReactNode; accent?: boolean; divider?: boolean }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 16px', borderBottom: divider ? `0.5px solid ${C.borderLight}` : 'none',
    }}>
      <span style={{ fontSize: 15, fontWeight: 500, color: accent ? C.planned : C.text }}>{label}</span>
      {value != null && <span style={{ fontSize: 15, color: C.textSec }}>{value}</span>}
    </div>
  );
}

// ── Activity card ──────────────────────────────────────────────
function ActivityCard({ activity, mine }: { activity: Activity; mine?: boolean }) {
  const col = ACTIVITY_TYPE_COLORS[activity.activity_type];
  const icon = ACTIVITY_TYPE_ICONS[activity.activity_type];
  const label = ACTIVITY_TYPE_LABELS[activity.activity_type];
  const place = activity.place?.name ?? activity.custom_place;
  const timingMap = {
    now: { t: 'Teraz', c: C.accentLight, bg: C.accentBg },
    soon: { t: 'Za chwilę', c: C.soon, bg: C.soonBg },
    planned: { t: 'Planowane', c: C.planned, bg: C.plannedBg },
  }[activity.timing];

  return (
    <Card style={{ marginBottom: 12, padding: 16 }}>
      <div style={{ display: 'flex', gap: 13, alignItems: 'flex-start' }}>
        <div style={{
          width: 46, height: 46, borderRadius: 14, background: col + '26',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 21, color: col, border: `0.5px solid ${col}40`,
        }}>{icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 16, color: C.text }}>
              {mine ? 'Ty' : activity.profile.name}
            </span>
            <span style={{ fontSize: 11, fontWeight: 600, color: timingMap.c, background: timingMap.bg, padding: '3px 9px', borderRadius: 999 }}>{timingMap.t}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4 }}>
            <span style={{ fontWeight: 600, fontSize: 14, color: C.textSec }}>{label}</span>
            {place && <span style={{ fontSize: 13.5, color: C.textTert }}>· {place}</span>}
          </div>
          {activity.message && (
            <div style={{ fontSize: 13.5, color: C.textSec, fontStyle: 'italic', marginTop: 7 }}>"{activity.message}"</div>
          )}
          {activity.joins.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 11 }}>
              <div style={{ display: 'flex' }}>
                {activity.joins.map((j, i) => (
                  <div key={j.id} style={{ marginLeft: i === 0 ? 0 : -8 }}>
                    <Avatar initials={getInitials(j.profile.name)} color={ACTIVITY_TYPE_COLORS.coworking} size={24} />
                  </div>
                ))}
              </div>
              <span style={{ fontSize: 12.5, color: C.textSec }}>{activity.joins.length} dołącza</span>
            </div>
          )}
        </div>
        <div style={{ alignSelf: 'center' }}>
          {mine
            ? <SmallButton variant="danger">Zakończ</SmallButton>
            : <SmallButton variant="green">Dołącz</SmallButton>}
        </div>
      </div>
    </Card>
  );
}

function FriendRow({ f, last }: { f: FriendWithStatus; last?: boolean }) {
  const a = f.activity;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 13, padding: '13px 16px',
      borderBottom: last ? 'none' : `0.5px solid ${C.borderLight}`, opacity: a ? 1 : 0.55,
    }}>
      <Avatar initials={f.initials} color={f.color} size={42} online={!!a} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{f.profile.name}</div>
        {a ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
            <span style={{ fontSize: 12, color: ACTIVITY_TYPE_COLORS[a.activity_type] }}>{ACTIVITY_TYPE_ICONS[a.activity_type]}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.textSec }}>{ACTIVITY_TYPE_LABELS[a.activity_type]}</span>
            {a.place && <span style={{ fontSize: 12.5, color: C.textTert }}>· {a.place.name}</span>}
          </div>
        ) : (
          <div style={{ fontSize: 12.5, color: C.textTert }}>Lokalizuję…</div>
        )}
      </div>
      {a && <SmallButton variant="green">Dołącz</SmallButton>}
    </div>
  );
}

// ── Sheet content per tab ──────────────────────────────────────
function OsobyContent() {
  return (
    <>
      <div style={{ display: 'flex', gap: 18, overflowX: 'auto', padding: '4px 6px 16px' }} className="hide-scrollbar">
        {friends.map(f => (
          <div key={f.profile.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, width: 52, flexShrink: 0 }}>
            <Avatar initials={f.initials} color={f.color} size={44} online={f.online} />
            <span style={{ fontSize: 11, color: C.textSec, maxWidth: 52, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.profile.name.split(' ')[0]}</span>
          </div>
        ))}
      </div>
      <Card style={{ marginBottom: 16 }}>
        {friends.map((f, i) => <FriendRow key={f.profile.id} f={f} last={i === friends.length - 1} />)}
      </Card>
      <button style={{
        width: '100%', padding: '16px', borderRadius: 16, border: 'none',
        background: C.accent, color: '#06210f', fontWeight: 700, fontSize: 15,
        cursor: 'pointer', fontFamily: FONT, boxShadow: `0 8px 24px ${C.accentBg}`,
      }}>Zaplanuj spotkanie</button>
    </>
  );
}

function FeedContent() {
  return (
    <>
      {activities.map(a => <ActivityCard key={a.id} activity={a} />)}
    </>
  );
}

function FriendsContent() {
  const active = friends.filter(f => f.activity);
  const offline = friends.filter(f => !f.activity);
  return (
    <>
      {pendingRequests.length > 0 && (
        <>
          <SectionLabel>Zaproszenia · {pendingRequests.length}</SectionLabel>
          <Card>
            {pendingRequests.map((req, i) => (
              <div key={req.id} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 16px', borderBottom: i === pendingRequests.length - 1 ? 'none' : `0.5px solid ${C.borderLight}` }}>
                <Avatar initials={getInitials(req.name)} color={ACTIVITY_TYPE_COLORS.galeria} size={42} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{req.name}</div>
                  <div style={{ fontSize: 12.5, color: C.textTert }}>Zaprasza do znajomych</div>
                </div>
                <SmallButton variant="green">Akceptuj</SmallButton>
                <SmallButton variant="danger">Odrzuć</SmallButton>
              </div>
            ))}
          </Card>
        </>
      )}
      <SectionLabel>Teraz aktywni · {active.length}</SectionLabel>
      <Card>{active.map((f, i) => <FriendRow key={f.profile.id} f={f} last={i === active.length - 1} />)}</Card>
      <SectionLabel>Znajomi · {offline.length}</SectionLabel>
      <Card>{offline.map((f, i) => <FriendRow key={f.profile.id} f={f} last={i === offline.length - 1} />)}</Card>
    </>
  );
}

function JaContent() {
  const [share, setShare] = useState(true);
  const [requests, setRequests] = useState(true);
  return (
    <>
      <div style={{ fontSize: 14, color: C.textSec, margin: '-4px 4px 16px' }}>
        Disseminat Polígon 25, 648, Manacor · Baleary, Hiszpania
      </div>

      <SectionLabel>Moje położenie</SectionLabel>
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: `0.5px solid ${C.borderLight}` }}>
          <span style={{ fontSize: 15, fontWeight: 500, color: C.text }}>Udostępniaj moje położenie</span>
          <Toggle on={share} onChange={() => setShare(v => !v)} />
        </div>
        <Row label="Udostępniasz z:" value="Ten telefon" />
        <Row label="Etykieta położenia" value={<span>Brak ›</span>} divider={false} />
      </Card>

      <SectionLabel>Powiadomienia</SectionLabel>
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: `0.5px solid ${C.borderLight}` }}>
          <span style={{ fontSize: 15, fontWeight: 500, color: C.text }}>Zezwalaj na prośby</span>
          <Toggle on={requests} onChange={() => setRequests(v => !v)} />
        </div>
        <Row label="Dostosuj powiadomienia" accent value={<span style={{ color: C.planned }}>›</span>} divider={false} />
      </Card>

      <SectionLabel>Zaproszenie</SectionLabel>
      <Card style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16 }}>
        <div>
          <div style={{ fontSize: 12, color: C.textTert, marginBottom: 4 }}>Twój kod</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.text, letterSpacing: 0.5 }}>{me.invite_code}</div>
        </div>
        <SmallButton variant="green">Kopiuj</SmallButton>
      </Card>

      <div style={{ marginTop: 22 }}>
        <SmallButton variant="danger">Wyloguj się</SmallButton>
      </div>
    </>
  );
}

// ── Round glass icon button ────────────────────────────────────
function GlassIcon({ children, onClick, size = 44 }: { children: React.ReactNode; onClick?: () => void; size?: number }) {
  return (
    <button onClick={onClick} style={{
      ...GLASS, width: size, height: size, borderRadius: size / 2, cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: C.text, fontSize: 18, fontWeight: 700, fontFamily: FONT,
      boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
    }}>{children}</button>
  );
}

// ── Persistent map background ──────────────────────────────────
function MapBackground({ active }: { active: Tab }) {
  const withCoords = activities.filter(a => a.place);
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/* dark green map */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(120% 90% at 50% 25%, #2e4138 0%, #243029 55%, #18211c 100%)',
      }} />
      {/* faint roads */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.5 }} preserveAspectRatio="none" viewBox="0 0 390 700">
        <g stroke="rgba(255,255,255,0.12)" strokeWidth="2" fill="none">
          <path d="M-20 180 Q120 220 200 120 T420 90" />
          <path d="M40 -20 Q90 200 60 400 T120 720" />
          <path d="M-20 480 Q160 440 260 520 T430 470" />
          <path d="M260 -20 Q300 220 360 320 T420 640" />
        </g>
        <path d="M40 -20 Q90 200 60 400 T120 720" stroke="rgba(90,140,250,0.4)" strokeWidth="2.5" fill="none" />
      </svg>

      {/* my location dot */}
      <div style={{ position: 'absolute', top: '32%', left: '46%' }}>
        <div style={{ width: 22, height: 22, borderRadius: 11, background: '#0A84FF', border: '3px solid #fff', boxShadow: '0 0 0 6px rgba(10,132,255,0.25), 0 4px 12px rgba(0,0,0,0.4)' }} />
      </div>

      {/* place pins (only on Osoby tab to keep map clean elsewhere) */}
      {active === 'map' && withCoords.map((a, i) => {
        const col = PLACE_TYPE_COLORS[a.place!.type] ?? C.accent;
        const positions = [{ top: '20%', left: '32%' }, { top: '36%', left: '64%' }, { top: '26%', left: '50%' }];
        return (
          <div key={a.id} style={{ position: 'absolute', ...positions[i % 3], transform: 'translate(-50%,-100%)' }}>
            <div style={{
              ...GLASS, background: C.surfaceSolid, borderRadius: 999, padding: '5px 12px 5px 8px',
              display: 'flex', alignItems: 'center', gap: 7,
              boxShadow: '0 6px 18px rgba(0,0,0,0.4)', fontFamily: FONT,
            }}>
              <span style={{ width: 8, height: 8, borderRadius: 4, background: col }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{a.profile.name.split(' ')[0]}</span>
            </div>
          </div>
        );
      })}

      {/* profile btn */}
      <div style={{ position: 'absolute', top: 16, left: 16 }}>
        <GlassIcon>{me.name[0]}</GlassIcon>
      </div>

      {/* map controls stacked (like iOS) */}
      <div style={{
        position: 'absolute', top: 16, right: 16, ...GLASS, borderRadius: 22,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
      }}>
        <button style={{ background: 'none', border: 'none', width: 44, height: 44, color: C.text, fontSize: 17, cursor: 'pointer' }}>⧉</button>
        <div style={{ height: 0.5, background: C.border }} />
        <button style={{ background: 'none', border: 'none', width: 44, height: 44, color: C.accent, fontSize: 17, cursor: 'pointer' }}>➤</button>
      </div>
    </div>
  );
}

// ── Shell ──────────────────────────────────────────────────────
export default function RundaApp() {
  const [active, setActive] = useState<Tab>('map');

  // Draggable bottom sheet — shared across all tabs
  const PEEK = 150;
  const sheetRef = useRef<HTMLDivElement>(null);
  const [sheetH, setSheetH] = useState(560);
  const [expanded, setExpanded] = useState(false);
  const [drag, setDrag] = useState<{ startY: number; baseT: number; t: number } | null>(null);

  useLayoutEffect(() => {
    if (sheetRef.current) setSheetH(sheetRef.current.offsetHeight);
  }, []);

  const collapsedT = Math.max(0, sheetH - PEEK);
  const baseT = expanded ? 0 : collapsedT;
  const translate = drag ? drag.t : baseT;

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    setDrag({ startY: e.clientY, baseT, t: baseT });
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag) return;
    const next = Math.min(collapsedT, Math.max(0, drag.baseT + (e.clientY - drag.startY)));
    setDrag({ ...drag, t: next });
  };
  const onPointerUp = () => {
    if (!drag) return;
    setExpanded(drag.t < collapsedT / 2);
    setDrag(null);
  };

  const selectTab = (key: Tab) => {
    setActive(key);
    setExpanded(true);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT }}>
      <div style={{
        width: '100%', maxWidth: 430, height: '100dvh', maxHeight: 932,
        background: C.bg, position: 'relative', overflow: 'hidden',
        boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
      }}>
        {/* persistent map */}
        <div style={{ position: 'absolute', inset: 0, paddingTop: 'env(safe-area-inset-top, 14px)' }}>
          <MapBackground active={active} />
        </div>

        {/* draggable glass bottom sheet */}
        <div
          ref={sheetRef}
          style={{
            position: 'absolute', left: 0, right: 0, bottom: 86, top: 90,
            ...GLASS, background: C.surfaceSolid, backdropFilter: 'blur(34px) saturate(180%)',
            WebkitBackdropFilter: 'blur(34px) saturate(180%)',
            borderRadius: 30,
            boxShadow: '0 -12px 40px rgba(0,0,0,0.5)',
            transform: `translateY(${translate}px)`,
            transition: drag ? 'none' : 'transform .32s cubic-bezier(.32,.72,0,1)',
            touchAction: 'none', display: 'flex', flexDirection: 'column',
          }}
        >
          <div
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onClick={() => setExpanded(v => !v)}
            style={{ padding: '12px 22px 6px', cursor: 'grab', touchAction: 'none', flexShrink: 0 }}
          >
            <div style={{ width: 38, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.22)', margin: '0 auto 14px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: C.text, letterSpacing: -0.8 }}>{SHEET_TITLE[active]}</div>
              {active === 'profile' && <GlassIcon size={38}>+</GlassIcon>}
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px 120px' }} className="hide-scrollbar">
            {active === 'map' && <OsobyContent />}
            {active === 'feed' && <FeedContent />}
            {active === 'friends' && <FriendsContent />}
            {active === 'profile' && <JaContent />}
          </div>
        </div>

        {/* glass tab bar */}
        <div style={{
          position: 'absolute', left: 16, right: 16, bottom: 18, borderRadius: 26,
          ...GLASS, background: 'rgba(20,23,24,0.6)',
          backdropFilter: 'blur(30px) saturate(180%)', WebkitBackdropFilter: 'blur(30px) saturate(180%)',
          boxShadow: '0 10px 34px rgba(0,0,0,0.45)', display: 'flex', padding: '11px 8px', zIndex: 10,
        }}>
          {TABS.map(tab => {
            const isActive = active === tab.key;
            return (
              <button key={tab.key} onClick={() => selectTab(tab.key)} style={{
                flex: 1, background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                fontFamily: FONT, padding: 0,
              }}>
                <span style={{ fontSize: 20, color: isActive ? C.accent : C.textTert, transition: 'color .2s' }}>{tab.icon}</span>
                <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 500, color: isActive ? C.text : C.textTert }}>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
