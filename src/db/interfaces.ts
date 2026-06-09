import { type ALLOWED_ICON_TYPES } from "../consts.ts";

// result interfaces
export interface ReferProps {
    id: number,
    uid: number,
    uses: number,
    max_uses: number,
    link: string
}

export interface UserProps {
    id: number,
    login_name: string,
    user_name: string,
    tag: string,
    pwd_hash: string,
    pgp: string | null
    rank: number,
    created: Date,
    refer: string,
    pfp_url: string,
    bio: string | null
}

export interface FilteredUserProps {
    user_name: string,
    tag: string,
    pgp: string | null
    rank: number,
    created: Date,
    pfp_url: string,
    bio: string | null,
    owns: boolean
}

export interface FullFilteredUserProps {
    user_name: string,
    tag: string,
    pgp: string | null
    rank: number,
    created: Date,
    pfp_url: string,
    bio: string | null,
    owns: boolean,
    links: FilteredUserLink[]
}

export interface SessionProps {
    id: string,
    uid: number,
    name: string,
    expiry: Date
}

export interface UserLink {
    id: number,
    uid: number,
    type: ALLOWED_ICON_TYPES,
    redir: string
}

export interface FilteredUserLink {
    type: ALLOWED_ICON_TYPES,
    redir: string
}