import { type ALLOWED_ICON_TYPES } from "../consts.ts";

// result interfaces
export interface ReferProps {
  id: number;
  uid: number;
  uses: number;
  max_uses: number;
  link: string;
}

export interface Theme {
  backgroundColor: string;
  backgroundColorDark: string;
  textColor: string;
  textColorDarker: string;
  pfpBorderColor: string;
  pfpBorderGlowColor: string;
}

export interface UserProps {
  id: number;
  login_name: string;
  user_name: string;
  tag: string;
  pwd_hash: string;
  pgp: string | null;
  rank: number;
  created: Date;
  refer: string;
  pfp_url: string;
  bio: string | null;
  songs: string | null;
  theme: Theme;
}

export interface FilteredUserProps {
  user_name: string;
  tag: string;
  pgp: string | null;
  rank: number;
  created: Date;
  pfp_url: string;
  bio: string | null;
  songs: string | null;
  owns: boolean;
  theme: Theme;
}

export interface FullFilteredUserProps {
  user_name: string;
  tag: string;
  pgp: string | null;
  rank: number;
  created: Date;
  pfp_url: string;
  bio: string | null;
  songs: UserSong[];
  owns: boolean;
  links: FilteredUserLink[];
  theme: Theme;
}

export interface SessionProps {
  id: string;
  uid: number;
  name: string;
  expiry: Date;
}

export interface UserLink {
  id: number;
  uid: number;
  type: ALLOWED_ICON_TYPES;
  redir: string;
}

export interface FilteredUserLink {
  type: ALLOWED_ICON_TYPES;
  redir: string;
}

export interface UserSong {
  id: number;
  uid: number;
  name: string;
  artist: string;
  cover_src: string;
  audio_src: string;
  created: Date;
}

export interface UserEditData {
  bio: string;
  tag: string;
  themeValues: Theme;
  userName: string;
}
