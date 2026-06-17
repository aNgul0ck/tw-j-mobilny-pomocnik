import { ActivityType, ActivityTiming, PlaceType, avatarColor, getInitials } from './theme';

export interface Profile {
  id: string;
  name: string;
  username: string | null;
  invite_code: string;
}

export interface Place {
  id: number;
  name: string;
  type: PlaceType;
  lat: number;
  lng: number;
  radius_m: number;
}

export interface ActivityJoin {
  id: string;
  user_id: string;
  eta_minutes: number | null;
  profile: Profile;
}

export interface Activity {
  id: string;
  user_id: string;
  activity_type: ActivityType;
  custom_place: string | null;
  message: string | null;
  timing: ActivityTiming;
  created_at: string;
  profile: Profile;
  place: Place | null;
  joins: ActivityJoin[];
}

export interface FriendWithStatus {
  profile: Profile;
  color: string;
  initials: string;
  online: boolean;
  activity: Activity | null;
}

export const me: Profile = {
  id: 'me-antek',
  name: 'Antek Golik',
  username: 'antek',
  invite_code: 'RUNDA-A7K3',
};

const p = (id: string, name: string): Profile => ({
  id, name, username: name.split(' ')[0].toLowerCase(), invite_code: 'RUNDA-' + id.slice(0, 4).toUpperCase(),
});

const kuba = p('u-kuba', 'Kuba Nowak');
const ola = p('u-ola', 'Ola Wiśniewska');
const michal = p('u-michal', 'Michał Zieliński');
const zosia = p('u-zosia', 'Zosia Kamińska');
const piotr = p('u-piotr', 'Piotr Lewandowski');
const marta = p('u-marta', 'Marta Dąbrowska');

export const places: Place[] = [
  { id: 1, name: 'Forum Kawowe', type: 'cafe', lat: 52.231, lng: 21.006, radius_m: 120 },
  { id: 2, name: 'Park Łazienki', type: 'park', lat: 52.215, lng: 21.034, radius_m: 250 },
  { id: 3, name: 'Zdrofit Centrum', type: 'gym', lat: 52.229, lng: 21.012, radius_m: 100 },
  { id: 4, name: 'Galeria Złote Tarasy', type: 'museum', lat: 52.229, lng: 21.001, radius_m: 180 },
  { id: 5, name: 'Plac Zbawiciela', type: 'bar', lat: 52.219, lng: 21.018, radius_m: 90 },
];

const now = Date.now();
const ago = (min: number) => new Date(now - min * 60000).toISOString();

export const activities: Activity[] = [
  {
    id: 'a1', user_id: kuba.id, activity_type: 'kawa', custom_place: null,
    message: 'Mam wolną godzinę, ktoś chętny?', timing: 'now', created_at: ago(8),
    profile: kuba, place: places[0],
    joins: [{ id: 'j1', user_id: ola.id, eta_minutes: 10, profile: ola }],
  },
  {
    id: 'a2', user_id: michal.id, activity_type: 'siłownia', custom_place: null,
    message: null, timing: 'soon', created_at: ago(20),
    profile: michal, place: places[2], joins: [],
  },
  {
    id: 'a3', user_id: zosia.id, activity_type: 'spacer', custom_place: null,
    message: 'Pogoda super, idę na rundkę 🌿', timing: 'now', created_at: ago(35),
    profile: zosia, place: places[1], joins: [
      { id: 'j2', user_id: marta.id, eta_minutes: null, profile: marta },
    ],
  },
];

export const friends: FriendWithStatus[] = [
  { profile: kuba, color: avatarColor(kuba.id), initials: getInitials(kuba.name), online: true, activity: activities[0] },
  { profile: zosia, color: avatarColor(zosia.id), initials: getInitials(zosia.name), online: true, activity: activities[2] },
  { profile: michal, color: avatarColor(michal.id), initials: getInitials(michal.name), online: true, activity: activities[1] },
  { profile: ola, color: avatarColor(ola.id), initials: getInitials(ola.name), online: false, activity: null },
  { profile: piotr, color: avatarColor(piotr.id), initials: getInitials(piotr.name), online: false, activity: null },
  { profile: marta, color: avatarColor(marta.id), initials: getInitials(marta.name), online: false, activity: null },
];

export const pendingRequests: Profile[] = [p('u-anna', 'Anna Mazur')];
