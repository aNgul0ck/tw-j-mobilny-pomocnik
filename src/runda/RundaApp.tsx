import { useState, useRef, useLayoutEffect } from 'react';
import {
  MapPin, ListChecks, Users, User,
  Navigation, Layers, Plus, type LucideIcon,
} from 'lucide-react';
import {
  C, ACTIVITY_TYPE_LABELS, ACTIVITY_TYPE_ICONS, ACTIVITY_TYPE_COLORS,
  getInitials, avatarColor,
} from './theme';
import {
  me, friends, activities, pendingRequests, contacts,
  Activity, FriendWithStatus, Profile, Contact,
} from './mock';

const FONT = "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif";

const GLASS: React.CSSProperties = {
  background: C.surface,
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: `0.5px solid ${C.border}`,
};

type Tab = 'map' | 'feed' | 'friends' | 'profile';

const TABS: { key: Tab; label: string; icon: LucideIcon }[] = [
  { key: 'map', label: 'Osoby', icon: MapPin },
  { key: 'feed', label: 'Aktywności', icon: ListChecks },
  { key: 'friends', label: 'Znajomi', icon: Users },
  { key: 'profile', label: 'Ja', icon: User },
];

const SHEET_TITLE: Record<Tab, string> = {
  map: 'Osoby',
  feed: 'Aktywności',
  friends: 'Znajomi',
  profile: 'Ja',
};

// People sharing location right now (subset shown on the map).
const sharing = friends.filter(f => f.online);
const PIN_POS = [{ top: '22%', left: '30%' }, { top: '30%', left: '66%' }, { top: '46%', left: '52%' }];

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
          borderRadius: size, background: C.online, border: '2px solid #000',
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
        width: 26, height: 26, borderRadius: 13, background: on ? '#000' : '#fff',
        boxShadow: '0 2px 6px rgba(0,0,0,0.3)', transition: 'all .2s',
      }} />

    </button>
  );
}

function Row({ label, value, onClick, divider = true }: { label: React.ReactNode; value?: React.ReactNode; onClick?: () => void; divider?: boolean }) {
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 16px', borderBottom: divider ? `0.5px solid ${C.borderLight}` : 'none',
      cursor: onClick ? 'pointer' : 'default',
    }}>
      <span style={{ fontSize: 15, fontWeight: 500, color: C.text }}>{label}</span>
      {value != null && <span style={{ fontSize: 15, color: C.textSec }}>{value}</span>}
    </div>
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

// ── Activity card (Aktywności) ─────────────────────────────────
function ActivityCard({ activity, mine, joined, onToggleJoin }: {
  activity: Activity; mine?: boolean; joined?: boolean; onToggleJoin?: () => void;
}) {
  const col = ACTIVITY_TYPE_COLORS[activity.activity_type];
  const icon = ACTIVITY_TYPE_ICONS[activity.activity_type];
  const label = ACTIVITY_TYPE_LABELS[activity.activity_type];
  const place = activity.place?.name ?? activity.custom_place;
  const timingMap = {
    now: { t: 'Teraz', c: C.online, bg: C.onlineBg },
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
          {(activity.joins.length > 0 || joined) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 11 }}>
              <span style={{ fontSize: 12.5, color: C.textSec }}>
                {activity.joins.length + (joined ? 1 : 0)} dołącza{joined ? ' (Ty)' : ''}
              </span>
            </div>
          )}
        </div>
        <div style={{ alignSelf: 'center' }}>
          {mine
            ? <SmallButton variant="danger">Zakończ</SmallButton>
            : <SmallButton variant={joined ? 'plain' : 'green'} onClick={onToggleJoin}>{joined ? 'Anuluj' : 'Dołącz'}</SmallButton>}
        </div>
      </div>
    </Card>
  );
}

// ── Tab content: Osoby (live location) ─────────────────────────
function OsobyContent({ onFocus, onPlan }: { onFocus: (id: string) => void; onPlan: () => void }) {
  return (
    <>
      <div style={{ display: 'flex', gap: 18, overflowX: 'auto', padding: '4px 6px 16px' }} className="hide-scrollbar">
        {sharing.map(f => (
          <button key={f.profile.id} onClick={() => onFocus(f.profile.id)} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, width: 52, flexShrink: 0,
            background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONT, padding: 0,
          }}>
            <Avatar initials={f.initials} color={f.color} size={44} online={f.online} />
            <span style={{ fontSize: 11, color: C.textSec, maxWidth: 52, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.profile.name.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      <SectionLabel>Udostępniają położenie · {sharing.length}</SectionLabel>
      <Card style={{ marginBottom: 16 }}>
        {sharing.map((f, i) => {
          const a = f.activity;
          return (
            <div key={f.profile.id} style={{
              display: 'flex', alignItems: 'center', gap: 13, padding: '13px 16px',
              borderBottom: i === sharing.length - 1 ? 'none' : `0.5px solid ${C.borderLight}`,
            }}>
              <Avatar initials={f.initials} color={f.color} size={42} online />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{f.profile.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                  {a ? (
                    <>
                      <span style={{ fontSize: 12, color: ACTIVITY_TYPE_COLORS[a.activity_type] }}>{ACTIVITY_TYPE_ICONS[a.activity_type]}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: C.textSec }}>{ACTIVITY_TYPE_LABELS[a.activity_type]}</span>
                      {a.place && <span style={{ fontSize: 12.5, color: C.textTert }}>· {a.place.name}</span>}
                    </>
                  ) : <span style={{ fontSize: 12.5, color: C.textTert }}>W pobliżu</span>}
                </div>
              </div>
              <SmallButton onClick={() => onFocus(f.profile.id)}>Pokaż</SmallButton>
            </div>
          );
        })}
      </Card>

      <button onClick={onPlan} style={{
        width: '100%', padding: '16px', borderRadius: 16, border: 'none',
        background: '#fff', color: '#000', fontWeight: 800, fontSize: 15, letterSpacing: -0.2,
        cursor: 'pointer', fontFamily: FONT, boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
      }}>Zaplanuj spotkanie</button>
    </>
  );
}

// ── Tab content: Aktywności ────────────────────────────────────
function FeedContent({ joined, onToggleJoin }: { joined: Record<string, boolean>; onToggleJoin: (id: string) => void }) {
  return (
    <>
      {activities.map(a => (
        <ActivityCard key={a.id} activity={a} joined={!!joined[a.id]} onToggleJoin={() => onToggleJoin(a.id)} />
      ))}
    </>
  );
}

// ── Tab content: Znajomi (location sharing via contacts) ───────
function FriendsContent({ requests, onAccept, onReject }: {
  requests: Profile[]; onAccept: (id: string) => void; onReject: (id: string) => void;
}) {
  // Who I currently share my location with (start with online friends).
  const [shareWith, setShareWith] = useState<Record<string, boolean>>(
    () => Object.fromEntries(friends.map(f => [f.profile.id, f.online])),
  );
  const [shared, setShared] = useState<Record<string, boolean>>({});

  return (
    <>
      {requests.length > 0 && (
        <>
          <SectionLabel>Udostępnia Ci położenie · {requests.length}</SectionLabel>
          <Card>
            {requests.map((req, i) => (
              <div key={req.id} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 16px', borderBottom: i === requests.length - 1 ? 'none' : `0.5px solid ${C.borderLight}` }}>
                <Avatar initials={getInitials(req.name)} color={avatarColor(req.id)} size={42} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{req.name}</div>
                  <div style={{ fontSize: 12.5, color: C.textTert }}>{req.phone}</div>
                </div>
                <SmallButton variant="green" onClick={() => onAccept(req.id)}>Odwzajemnij</SmallButton>
                <SmallButton variant="danger" onClick={() => onReject(req.id)}>Ukryj</SmallButton>
              </div>
            ))}
          </Card>
        </>
      )}

      <SectionLabel>Udostępniasz położenie · {Object.values(shareWith).filter(Boolean).length}</SectionLabel>
      <Card>
        {friends.map((f, i) => {
          const on = !!shareWith[f.profile.id];
          return (
            <div key={f.profile.id} style={{
              display: 'flex', alignItems: 'center', gap: 13, padding: '13px 16px',
              borderBottom: i === friends.length - 1 ? 'none' : `0.5px solid ${C.borderLight}`,
            }}>
              <Avatar initials={f.initials} color={f.color} size={42} online={f.online} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{f.profile.name}</div>
                <div style={{ fontSize: 12.5, color: f.online ? C.accentLight : C.textTert, marginTop: 2 }}>
                  {f.online ? 'Udostępnia Ci położenie' : 'Nie udostępnia'}
                </div>
              </div>
              <Toggle on={on} onChange={() => setShareWith(s => ({ ...s, [f.profile.id]: !s[f.profile.id] }))} />
            </div>
          );
        })}
      </Card>

      <SectionLabel>Z kontaktów</SectionLabel>
      <Card>
        {contacts.map((c, i) => {
          const isShared = !!shared[c.phone];
          return (
            <div key={c.phone} style={{
              display: 'flex', alignItems: 'center', gap: 13, padding: '13px 16px',
              borderBottom: i === contacts.length - 1 ? 'none' : `0.5px solid ${C.borderLight}`,
            }}>
              <Avatar initials={getInitials(c.name)} color={avatarColor(c.phone)} size={42} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{c.name}</div>
                <div style={{ fontSize: 12.5, color: C.textTert, marginTop: 2 }}>
                  {c.phone}{c.onApp ? ' · jest w Runda' : ' · zaproś'}
                </div>
              </div>
              <SmallButton
                variant={isShared ? 'plain' : 'green'}
                onClick={() => setShared(s => ({ ...s, [c.phone]: !s[c.phone] }))}
              >
                {isShared ? 'Udostępniasz ✓' : c.onApp ? 'Udostępnij' : 'Zaproś'}
              </SmallButton>
            </div>
          );
        })}
      </Card>
    </>
  );
}

// ── Tab content: Ja (settings) ─────────────────────────────────
function JaContent() {
  const [share, setShare] = useState(true);
  const [requests, setRequests] = useState(true);
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard?.writeText(me.phone).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

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
        <Row label="Etykieta położenia" value="Brak ›" onClick={() => {}} divider={false} />
      </Card>

      <SectionLabel>Powiadomienia</SectionLabel>
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: `0.5px solid ${C.borderLight}` }}>
          <span style={{ fontSize: 15, fontWeight: 500, color: C.text }}>Zezwalaj na prośby</span>
          <Toggle on={requests} onChange={() => setRequests(v => !v)} />
        </div>
        <Row label="Dostosuj powiadomienia" value="›" onClick={() => {}} divider={false} />
      </Card>

      <SectionLabel>Mój numer</SectionLabel>
      <Card style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16 }}>
        <div>
          <div style={{ fontSize: 12, color: C.textTert, marginBottom: 4 }}>Znajdą Cię po numerze</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.text, letterSpacing: 0.5 }}>{me.phone}</div>
        </div>
        <SmallButton variant="green" onClick={copy}>{copied ? 'Skopiowano ✓' : 'Kopiuj'}</SmallButton>
      </Card>

      <div style={{ marginTop: 22 }}>
        <SmallButton variant="danger">Wyloguj się</SmallButton>
      </div>
    </>
  );
}

// ── Persistent map background ──────────────────────────────────
function MapBackground({ active, selected, onSelect, onRecenter }: {
  active: Tab; selected: string | null; onSelect: (id: string | null) => void; onRecenter: () => void;
}) {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/* neutral dark map */}
      <div onClick={() => onSelect(null)} style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(120% 90% at 50% 25%, #1c1c1c 0%, #131313 55%, #000000 100%)',
      }} />
      {/* faint roads */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.4, pointerEvents: 'none' }} preserveAspectRatio="none" viewBox="0 0 390 700">
        <g stroke="rgba(255,255,255,0.10)" strokeWidth="2" fill="none">
          <path d="M-20 180 Q120 220 200 120 T420 90" />
          <path d="M40 -20 Q90 200 60 400 T120 720" />
          <path d="M-20 480 Q160 440 260 520 T430 470" />
          <path d="M260 -20 Q300 220 360 320 T420 640" />
        </g>
        <path d="M40 -20 Q90 200 60 400 T120 720" stroke="rgba(255,255,255,0.18)" strokeWidth="2.5" fill="none" />
      </svg>


      {/* my location dot */}
      <div style={{ position: 'absolute', top: '32%', left: '46%', pointerEvents: 'none' }}>
        <div style={{ width: 22, height: 22, borderRadius: 11, background: '#fff', border: '3px solid #000', boxShadow: '0 0 0 6px rgba(255,255,255,0.16), 0 4px 12px rgba(0,0,0,0.5)' }} />

      </div>

      {/* friend pins (people sharing location) — round avatar markers */}
      {active === 'map' && sharing.map((f, i) => {
        const isSel = selected === f.profile.id;
        const size = 48;
        return (
          <button
            key={f.profile.id}
            onClick={(e) => { e.stopPropagation(); onSelect(isSel ? null : f.profile.id); }}
            style={{
              position: 'absolute', ...PIN_POS[i % 3], transform: `translate(-50%,-50%) scale(${isSel ? 1.12 : 1})`,
              transition: 'transform .15s', background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, fontFamily: FONT,
            }}
          >
            <div style={{ position: 'relative', width: size, height: size }}>
              <div style={{
                width: size, height: size, borderRadius: size / 2, background: f.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 700, fontSize: size * 0.36,
                border: `2.5px solid ${isSel ? '#fff' : '#000'}`,
                boxShadow: isSel
                  ? '0 0 0 3px rgba(255,255,255,0.9), 0 8px 22px rgba(0,0,0,0.55)'
                  : '0 6px 18px rgba(0,0,0,0.55)',
              }}>{f.initials}</div>
              {f.online && (
                <div style={{
                  position: 'absolute', bottom: 1, right: 1, width: size * 0.26, height: size * 0.26,
                  borderRadius: size, background: C.online, border: '2px solid #000',
                }} />
              )}
            </div>
            <span style={{
              fontSize: 11.5, fontWeight: 700, color: '#fff', padding: '2px 8px', borderRadius: 999,
              background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
            }}>{f.profile.name.split(' ')[0]}</span>
          </button>
        );
      })}

      {/* map controls stacked (like iOS) */}
      <div style={{
        position: 'absolute', top: 16, right: 16, ...GLASS, borderRadius: 22,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
      }}>
        <button onClick={() => onSelect(null)} style={{ background: 'none', border: 'none', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Layers size={19} strokeWidth={1.8} color={C.text} /></button>
        <div style={{ height: 0.5, background: C.border }} />
        <button onClick={onRecenter} style={{ background: 'none', border: 'none', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Navigation size={18} strokeWidth={1.8} color={C.text} fill={C.text} /></button>
      </div>
    </div>
  );
}

// ── Shell ──────────────────────────────────────────────────────
export default function RundaApp() {
  const [active, setActive] = useState<Tab>('map');
  const [selected, setSelected] = useState<string | null>(null);
  const [joined, setJoined] = useState<Record<string, boolean>>({});
  const [requests, setRequests] = useState<Profile[]>(pendingRequests);

  // Draggable bottom sheet — fully hidden behind the nav bar when collapsed.
  const sheetRef = useRef<HTMLDivElement>(null);
  const [sheetH, setSheetH] = useState(560);
  const [expanded, setExpanded] = useState(false);
  const [drag, setDrag] = useState<{ startY: number; baseT: number; t: number } | null>(null);

  useLayoutEffect(() => {
    if (sheetRef.current) setSheetH(sheetRef.current.offsetHeight);
  }, []);

  // Collapsed → translate the whole sheet down past its own height so it
  // disappears behind the (higher z-index) nav bar; only the bar stays visible.
  const hiddenT = sheetH + 120;
  const baseT = expanded ? 0 : hiddenT;
  const translate = drag ? drag.t : baseT;

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    setDrag({ startY: e.clientY, baseT, t: baseT });
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag) return;
    const next = Math.min(hiddenT, Math.max(0, drag.baseT + (e.clientY - drag.startY)));
    setDrag({ ...drag, t: next });
  };
  const onPointerUp = () => {
    if (!drag) return;
    setExpanded(drag.t < hiddenT / 2);
    setDrag(null);
  };

  const selectTab = (key: Tab) => {
    setActive(key);
    setExpanded(true);
  };

  // Tap a person → switch to map, focus pin, collapse sheet to reveal it.
  const focusFriend = (id: string) => {
    setActive('map');
    setSelected(id);
    setExpanded(false);
  };

  const toggleJoin = (id: string) => setJoined(j => ({ ...j, [id]: !j[id] }));
  const acceptReq = (id: string) => setRequests(r => r.filter(x => x.id !== id));

  const headerAction = (() => {
    if (active === 'feed') return <GlassIcon size={38} onClick={() => {}}><Plus size={18} strokeWidth={2.2} color={C.text} /></GlassIcon>;
    if (active === 'friends') return <SmallButton variant="green">Dodaj</SmallButton>;
    if (active === 'profile') return <GlassIcon size={38} onClick={() => {}}><Plus size={18} strokeWidth={2.2} color={C.text} /></GlassIcon>;
    return null;
  })();

  return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT }}>
      <div style={{
        width: '100%', maxWidth: 430, height: '100dvh', maxHeight: 932,
        background: C.bg, position: 'relative', overflow: 'hidden',
        boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
      }}>
        {/* persistent map */}
        <div style={{ position: 'absolute', inset: 0, paddingTop: 'env(safe-area-inset-top, 14px)' }}>
          <MapBackground
            active={active}
            selected={selected}
            onSelect={setSelected}
            onRecenter={() => setSelected(null)}
          />
          {/* profile shortcut */}
          <div style={{ position: 'absolute', top: 16, left: 16 }}>
            <GlassIcon onClick={() => selectTab('profile')}>{me.name[0]}</GlassIcon>
          </div>
        </div>

        {/* draggable glass bottom sheet */}
        <div
          ref={sheetRef}
          style={{
            position: 'absolute', left: 0, right: 0, bottom: 86, top: 90,
            ...GLASS, background: C.surfaceSolid, backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
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
              <div style={{ fontSize: 28, fontWeight: 800, color: C.text, letterSpacing: -1 }}>{SHEET_TITLE[active]}<span style={{ color: C.text }}>.</span></div>
              {headerAction}
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px 24px' }} className="hide-scrollbar">
            {active === 'map' && <OsobyContent onFocus={focusFriend} onPlan={() => selectTab('feed')} />}
            {active === 'feed' && <FeedContent joined={joined} onToggleJoin={toggleJoin} />}
            {active === 'friends' && <FriendsContent requests={requests} onAccept={acceptReq} onReject={acceptReq} />}
            {active === 'profile' && <JaContent />}
          </div>
        </div>

        {/* glass tab bar */}
        <div style={{
          position: 'absolute', left: 16, right: 16, bottom: 18, borderRadius: 26,
          ...GLASS, background: 'rgba(12,12,12,0.72)',
          backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          boxShadow: '0 10px 34px rgba(0,0,0,0.45)', display: 'flex', padding: '11px 8px', zIndex: 10,
        }}>
          {TABS.map(tab => {
            const isActive = active === tab.key;
            const Icon = tab.icon;
            return (
              <button key={tab.key} onClick={() => selectTab(tab.key)} style={{
                flex: 1, background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                fontFamily: FONT, padding: 0,
              }}>
                <Icon size={21} strokeWidth={isActive ? 2.4 : 1.8} color={isActive ? C.text : C.textTert} style={{ transition: 'color .2s' }} />
                <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 500, color: isActive ? C.text : C.textTert }}>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
