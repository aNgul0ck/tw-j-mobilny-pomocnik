import { useState, useRef, useLayoutEffect } from 'react';
import {
  C, ACTIVITY_TYPE_LABELS, ACTIVITY_TYPE_ICONS, ACTIVITY_TYPE_COLORS,
  PLACE_TYPE_COLORS, getInitials,
} from './theme';
import {
  me, friends, activities, places, pendingRequests,
  Activity, FriendWithStatus, Profile,
} from './mock';

const FONT = "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif";

type Tab = 'map' | 'feed' | 'friends' | 'profile';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'map', label: 'Mapa', icon: '◈' },
  { key: 'feed', label: 'Aktywności', icon: '◉' },
  { key: 'friends', label: 'Znajomi', icon: '◎' },
  { key: 'profile', label: 'Ja', icon: '◇' },
];

// ── UI primitives ──────────────────────────────────────────────
function Avatar({ initials, color, size = 40, online }: { initials: string; color: string; size?: number; online?: boolean }) {
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <div style={{
        width: size, height: size, borderRadius: size / 2, background: color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontWeight: 700, fontSize: size * 0.38,
      }}>{initials}</div>
      {online && (
        <div style={{
          position: 'absolute', bottom: 0, right: 0, width: size * 0.28, height: size * 0.28,
          borderRadius: size, background: C.accent, border: '2px solid #fff',
        }} />
      )}
    </div>
  );
}

function SmallButton({ children, onClick, variant = 'plain' }: { children: React.ReactNode; onClick?: () => void; variant?: 'green' | 'danger' | 'plain' }) {
  const styles = {
    green: { background: C.accentBg, color: C.accent, border: `1px solid ${C.accentBorder}` },
    danger: { background: C.dangerBg, color: C.danger, border: `1px solid ${C.dangerBorder}` },
    plain: { background: 'rgba(0,0,0,0.04)', color: C.text, border: `1px solid ${C.border}` },
  }[variant];
  return (
    <button onClick={onClick} style={{
      ...styles, padding: '8px 14px', borderRadius: 11, fontWeight: 600, fontSize: 13,
      cursor: 'pointer', fontFamily: FONT, whiteSpace: 'nowrap',
    }}>{children}</button>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: C.surface, borderRadius: 18, border: `1px solid ${C.borderLight}`,
      overflow: 'hidden', ...style,
    }}>{children}</div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 600, color: C.textTert, letterSpacing: 0.8,
      textTransform: 'uppercase', margin: '14px 6px 8px',
    }}>{children}</div>
  );
}

function Header({ title }: { title: string }) {
  return (
    <div style={{ padding: '14px 22px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: C.textTert, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 3 }}>Runda</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: C.text, letterSpacing: -0.5 }}>{title}</div>
      </div>
    </div>
  );
}

// ── Activity card ──────────────────────────────────────────────
function ActivityCard({ activity, mine }: { activity: Activity; mine?: boolean }) {
  const col = ACTIVITY_TYPE_COLORS[activity.activity_type];
  const icon = ACTIVITY_TYPE_ICONS[activity.activity_type];
  const label = ACTIVITY_TYPE_LABELS[activity.activity_type];
  const place = activity.place?.name ?? activity.custom_place;
  const timingMap = { now: { t: 'Teraz', c: C.accent, bg: C.accentBg }, soon: { t: 'Za chwilę', c: C.soon, bg: C.soonBg }, planned: { t: 'Planowane', c: C.planned, bg: C.plannedBg } }[activity.timing];

  return (
    <Card style={{ marginBottom: 12, padding: 16 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{
          width: 44, height: 44, borderRadius: 13, background: col + '1A',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, color: col,
        }}>{icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 15.5, color: C.text }}>
              {mine ? 'Ty' : activity.profile.name}
            </span>
            <span style={{ fontSize: 11, fontWeight: 600, color: timingMap.c, background: timingMap.bg, padding: '2px 8px', borderRadius: 7 }}>{timingMap.t}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
            <span style={{ fontWeight: 600, fontSize: 13.5, color: C.text }}>{label}</span>
            {place && <span style={{ fontSize: 13, color: C.textSec }}>· {place}</span>}
          </div>
          {activity.message && (
            <div style={{ fontSize: 13, color: C.textSec, fontStyle: 'italic', marginTop: 6 }}>"{activity.message}"</div>
          )}
          {activity.joins.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 }}>
              <div style={{ display: 'flex' }}>
                {activity.joins.map((j, i) => (
                  <div key={j.id} style={{ marginLeft: i === 0 ? 0 : -8 }}>
                    <Avatar initials={getInitials(j.profile.name)} color={ACTIVITY_TYPE_COLORS.coworking} size={24} />
                  </div>
                ))}
              </div>
              <span style={{ fontSize: 12, color: C.textSec }}>{activity.joins.length} dołącza</span>
            </div>
          )}
        </div>
        {!mine && (
          <div style={{ alignSelf: 'center' }}>
            <SmallButton variant="green">Dołącz</SmallButton>
          </div>
        )}
        {mine && (
          <div style={{ alignSelf: 'center' }}>
            <SmallButton variant="danger">Zakończ</SmallButton>
          </div>
        )}
      </div>
    </Card>
  );
}

// ── Tabs ───────────────────────────────────────────────────────
function FeedTab() {
  const friendActs = activities;
  return (
    <div style={{ height: '100%', overflowY: 'auto' }} className="hide-scrollbar">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '14px 22px' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.textTert, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 3 }}>Runda</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.text, letterSpacing: -0.5 }}>Aktywności</div>
        </div>
        <SmallButton variant="green">+ Co robisz?</SmallButton>
      </div>
      <div style={{ padding: '0 16px 120px' }}>
        {friendActs.map(a => <ActivityCard key={a.id} activity={a} />)}
      </div>
    </div>
  );
}

function MapTab() {
  const withCoords = activities.filter(a => a.place);
  const [selected, setSelected] = useState<Activity | null>(null);

  // Draggable bottom sheet ---------------------------------------
  const PEEK = 200;            // visible height when collapsed
  const sheetRef = useRef<HTMLDivElement>(null);
  const [sheetH, setSheetH] = useState(420);
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

  return (
    <div style={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
      {/* faux map */}
      <div
        onClick={() => setSelected(null)}
        style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg,#E8ECE9 0%,#E2E8E4 40%,#E6EAE7 100%)',
          backgroundImage:
            'linear-gradient(rgba(0,0,0,0.035) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.035) 1px,transparent 1px)',
          backgroundSize: '44px 44px',
        }}
      />
      {/* place pins */}
      {withCoords.map((a, i) => {
        const col = PLACE_TYPE_COLORS[a.place!.type] ?? C.accent;
        const positions = [{ top: '22%', left: '30%' }, { top: '46%', left: '62%' }, { top: '64%', left: '38%' }];
        const isSel = selected?.id === a.id;
        return (
          <button
            key={a.id}
            onClick={() => setSelected(a)}
            style={{
              position: 'absolute', ...positions[i % 3], transform: 'translate(-50%,-100%)',
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            }}
          >
            <div style={{
              background: '#fff', borderRadius: 14, padding: '5px 10px 5px 7px',
              display: 'flex', alignItems: 'center', gap: 6,
              border: `1.5px solid ${isSel ? col : col + '60'}`,
              boxShadow: isSel ? `0 8px 22px ${col}55` : '0 6px 16px rgba(0,0,0,0.14)',
              transform: isSel ? 'scale(1.08)' : 'scale(1)', transition: 'transform .15s',
              fontFamily: FONT,
            }}>
              <span style={{ width: 8, height: 8, borderRadius: 4, background: col }} />
              <span style={{ fontSize: 12.5, fontWeight: 700, color: C.text }}>{a.profile.name.split(' ')[0]}</span>
            </div>
          </button>
        );
      })}

      {/* profile btn */}
      <div style={{
        position: 'absolute', top: 16, left: 16, width: 42, height: 42, borderRadius: 21,
        background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 700, color: C.text, boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
      }}>{me.name[0]}</div>

      {/* live pill */}
      <div style={{
        position: 'absolute', top: 16, right: 16, background: '#fff', borderRadius: 16,
        padding: '8px 13px', display: 'flex', alignItems: 'center', gap: 7,
        boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
      }}>
        <span style={{ width: 7, height: 7, borderRadius: 4, background: C.accent }} />
        <span style={{ fontSize: 12.5, fontWeight: 600, color: C.text }}>{withCoords.length} osób w pobliżu</span>
      </div>

      {/* selected pin detail card */}
      {selected && (
        <div style={{ position: 'absolute', left: 16, right: 16, bottom: PEEK + 28, zIndex: 5 }}>
          <ActivityCard activity={selected} />
        </div>
      )}

      {/* draggable bottom sheet */}
      <div
        ref={sheetRef}
        style={{
          position: 'absolute', left: 0, right: 0, bottom: 0,
          background: '#fff', borderTopLeftRadius: 26, borderTopRightRadius: 26,
          boxShadow: '0 -8px 24px rgba(0,0,0,0.08)',
          transform: `translateY(${translate}px)`,
          transition: drag ? 'none' : 'transform .32s cubic-bezier(.32,.72,0,1)',
          touchAction: 'none',
        }}
      >
        {/* drag handle area */}
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onClick={() => setExpanded(v => !v)}
          style={{ padding: '12px 16px 6px', cursor: 'grab', touchAction: 'none' }}
        >
          <div style={{ width: 38, height: 5, borderRadius: 3, background: 'rgba(0,0,0,0.14)', margin: '0 auto' }} />
          <div style={{ textAlign: 'center', fontSize: 12, fontWeight: 600, color: C.textTert, marginTop: 8 }}>
            {expanded ? 'Przeciągnij w dół, aby zamknąć' : `Znajomi w pobliżu · ${friends.length}`}
          </div>
        </div>

        <div style={{ padding: '6px 16px 110px' }}>
          <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 14 }} className="hide-scrollbar">
            {friends.map(f => (
              <div key={f.profile.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, width: 50, flexShrink: 0 }}>
                <Avatar initials={f.initials} color={f.color} size={40} online={f.online} />
                <span style={{ fontSize: 11, color: C.textSec, maxWidth: 50, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.profile.name.split(' ')[0]}</span>
              </div>
            ))}
          </div>

          {/* expanded content: full friend list */}
          <div style={{ marginBottom: 14 }}>
            {friends.map((f, i) => <FriendRow key={f.profile.id} f={f} last={i === friends.length - 1} />)}
          </div>

          <button style={{
            width: '100%', padding: '15px', borderRadius: 15, border: 'none',
            background: C.text, color: '#fff', fontWeight: 700, fontSize: 15,
            cursor: 'pointer', fontFamily: FONT,
          }}>Zaplanuj spotkanie</button>
        </div>
      </div>
    </div>
  );
}


function FriendRow({ f, last }: { f: FriendWithStatus; last?: boolean }) {
  const a = f.activity;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
      borderBottom: last ? 'none' : `1px solid ${C.borderLight}`, opacity: a ? 1 : 0.6,
    }}>
      <Avatar initials={f.initials} color={f.color} size={40} online={!!a} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14.5, fontWeight: 600, color: C.text }}>{f.profile.name}</div>
        {a ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
            <span style={{ fontSize: 12, color: ACTIVITY_TYPE_COLORS[a.activity_type] }}>{ACTIVITY_TYPE_ICONS[a.activity_type]}</span>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: C.text }}>{ACTIVITY_TYPE_LABELS[a.activity_type]}</span>
            {a.place && <span style={{ fontSize: 12, color: C.textSec }}>· {a.place.name}</span>}
          </div>
        ) : (
          <div style={{ fontSize: 12, color: C.textTert }}>Nieaktywny</div>
        )}
      </div>
      {a && <SmallButton variant="green">Dołącz</SmallButton>}
    </div>
  );
}

function FriendsTab() {
  const active = friends.filter(f => f.activity);
  const offline = friends.filter(f => !f.activity);
  return (
    <div style={{ height: '100%', overflowY: 'auto' }} className="hide-scrollbar">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '14px 22px' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.textTert, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 3 }}>Runda</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.text, letterSpacing: -0.5 }}>Znajomi</div>
        </div>
        <SmallButton variant="green">Dodaj</SmallButton>
      </div>
      <div style={{ padding: '0 16px 120px' }}>
        {pendingRequests.length > 0 && (
          <>
            <SectionLabel>Zaproszenia · {pendingRequests.length}</SectionLabel>
            <Card>
              {pendingRequests.map((req, i) => (
                <div key={req.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: i === pendingRequests.length - 1 ? 'none' : `1px solid ${C.borderLight}` }}>
                  <Avatar initials={getInitials(req.name)} color={ACTIVITY_TYPE_COLORS.galeria} size={40} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 600, color: C.text }}>{req.name}</div>
                    <div style={{ fontSize: 12, color: C.textTert }}>Zaprasza do znajomych</div>
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
      </div>
    </div>
  );
}

function ProfileTab() {
  const myPlaces = places.slice(0, 3);
  return (
    <div style={{ height: '100%', overflowY: 'auto' }} className="hide-scrollbar">
      <Header title="Ja" />
      <div style={{ padding: '0 16px 120px' }}>
        <Card style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <Avatar initials={getInitials(me.name)} color={ACTIVITY_TYPE_COLORS.spacer} size={64} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 19, fontWeight: 700, color: C.text }}>{me.name}</div>
            <div style={{ fontSize: 13, color: C.textSec }}>@{me.username}</div>
          </div>
          <SmallButton>Edytuj</SmallButton>
        </Card>

        <Card style={{ padding: 16, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 12, color: C.textTert, marginBottom: 3 }}>Twój kod zaproszenia</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: C.text, letterSpacing: 0.5 }}>{me.invite_code}</div>
          </div>
          <SmallButton variant="green">Kopiuj</SmallButton>
        </Card>

        <SectionLabel>Moje miejsca · {myPlaces.length}</SectionLabel>
        <Card>
          {myPlaces.map((pl, i) => {
            const col = PLACE_TYPE_COLORS[pl.type] ?? C.accent;
            return (
              <div key={pl.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderBottom: i === myPlaces.length - 1 ? 'none' : `1px solid ${C.borderLight}` }}>
                <span style={{ width: 10, height: 10, borderRadius: 5, background: col }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: C.text }}>{pl.name}</div>
                  <div style={{ fontSize: 12, color: C.textTert }}>Promień {pl.radius_m} m</div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: C.accent }}>Włączone</span>
              </div>
            );
          })}
        </Card>

        <div style={{ marginTop: 24 }}>
          <SmallButton variant="danger">Wyloguj się</SmallButton>
        </div>
      </div>
    </div>
  );
}

// ── Shell ──────────────────────────────────────────────────────
export default function RundaApp() {
  const [active, setActive] = useState<Tab>('map');

  return (
    <div style={{ minHeight: '100vh', background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, padding: '0' }}>
      <div style={{
        width: '100%', maxWidth: 430, height: '100dvh', maxHeight: 932,
        background: C.bg, position: 'relative', overflow: 'hidden',
        boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
      }}>
        <div style={{ position: 'absolute', inset: 0, paddingTop: 'env(safe-area-inset-top, 12px)' }}>
          {active === 'map' && <MapTab />}
          {active === 'feed' && <FeedTab />}
          {active === 'friends' && <FriendsTab />}
          {active === 'profile' && <ProfileTab />}
        </div>

        {/* tab bar */}
        <div style={{
          position: 'absolute', left: 20, right: 20, bottom: 20, borderRadius: 22,
          background: 'rgba(248,248,252,0.82)', backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)', border: '0.5px solid rgba(255,255,255,0.6)',
          boxShadow: '0 8px 28px rgba(0,0,0,0.16)', display: 'flex',
          padding: '10px 8px',
        }}>
          {TABS.map(tab => {
            const isActive = active === tab.key;
            return (
              <button key={tab.key} onClick={() => setActive(tab.key)} style={{
                flex: 1, background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                fontFamily: FONT, padding: 0,
              }}>
                <span style={{ fontSize: 20, color: isActive ? C.text : C.textTert }}>{tab.icon}</span>
                <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 500, color: isActive ? C.text : C.textTert }}>{tab.label}</span>
                {isActive && <span style={{ width: 4, height: 4, borderRadius: 2, background: C.text, marginTop: 1 }} />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
