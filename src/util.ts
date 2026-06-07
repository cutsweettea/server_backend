import * as argon2 from 'argon2';
import conf from './config.ts';

export function generateResponse(success: boolean, data: any) {
    return JSON.stringify({
        success: success,
        data: data
    });
}

export async function defaultHash(text: string): Promise<string> {
    return (await argon2.hash(text, {
        type: argon2.argon2id,
        memoryCost: 65536,
        timeCost: 1,
        parallelism: 1,
        salt: Buffer.from(genRandom(16))
    })).toString();
}

interface SaltExtractResult {
    salt: string,
    hash: string
}

const SALT_$_LOCATION = 4;
export async function extractSalt(hash: string): Promise<SaltExtractResult> {
    // split argon2 hash by $, extracting salt
    const spl = hash.split('$');
    const salt = spl[SALT_$_LOCATION];

    // return if salt is undef, splicing the salt out of array if not
    if(!salt) return Promise.reject('hash isnt valid format');
    spl.splice(SALT_$_LOCATION, 1);

    return {
        salt: atob(salt),
        hash: spl.join('$')
    };
}

export const defaultVerify = async (hash: string, text: string): Promise<boolean> => {
    return await argon2.verify(hash, text);
}

export const btoaNoPadding = (text: string) => {
    return btoa(text).replace(/=/g, '');
};

export const atobNoPadding = (text: string) => {
    const padLength = (4 - (text.length % 4)) % 4;
    const paddedStr = text.padEnd(text.length + padLength, '=');
    return atob(paddedStr);
};

const DEFAULT_COOKIE_EXPIRY = new Date(new Date().getTime()+8*60*60*1000);
export function generateCookieOpts(path?: string, expiry?: Date, domain?: string, httpOnly?: boolean, secure?: boolean, sameSite?: CookieSameSite, signed?: boolean) {
    return conf.prod ? {
        path: !path ? '/' : path,
        domain: !domain ? '.divine.frl' : domain,
        expires: !expiry ? DEFAULT_COOKIE_EXPIRY : expiry,
        httpOnly: !httpOnly ? true : httpOnly,
        secure: !secure ? true : secure,
        sameSite: !sameSite ? 'lax' : sameSite,
        signed: !signed ? true : signed
    } : {
        path: !path ? '/' : path,
        domain: !domain ? '.localhost' : domain,
        expires: !expiry ? DEFAULT_COOKIE_EXPIRY : expiry,
        httpOnly: !httpOnly ? true : httpOnly,
        secure: !secure ? false : secure,
        sameSite: !sameSite ? 'lax' : sameSite,
        signed: !signed ? false : signed
    };
}

export function genRandom(length: number): string {
    const rndb = new Uint8Array(length);
    crypto.getRandomValues(rndb);

    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let res = '';
    for (let i = 0; i < length; i++) {
        res += characters[rndb[i]! % characters.length];
    }
    
    return res;
}

const ranks = {
    DEFAULT: 0,
    OWNER: 1,
    ADMIN: 2,
    STREAMER: 3
} as const;

export function canAccess(rank: number, required: number): boolean {
    switch(required) {
        case ranks.OWNER: return rank == ranks.OWNER;
        case ranks.ADMIN: return rank == ranks.OWNER || rank == ranks.ADMIN;
        case ranks.STREAMER: return rank == ranks.OWNER || rank == ranks.STREAMER;
        case ranks.DEFAULT: return true;
        default: return false;
    }
}