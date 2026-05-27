import z from 'zod';

// schema consts

export const LOGIN_NAME_MAX_LEN = 32;
export const USER_NAME_MAX_LEN = 32;
export const PWD_MAX_LEN = 256;
export const PWD_HASH_MAX_LEN = 128;
export const REFER_MAX_LEN = 16;
export const PFP_URL_MAX_LEN = 128;
export const BIO_MAX_LEN = 500;
export const PGP_MAX_LEN = 2000;
export const TAG_MAX_LEN = 4;

// session ident constants
export const SESSION_LEN = 32;
export const ADMIN_SESSION_LEN = 64;

// zod consts

// zod generics
export const MIN_1_LEN = z.string().min(1);

// zod props
export const LOGIN_NAME_FIELD = MIN_1_LEN.max(LOGIN_NAME_MAX_LEN);
export const USER_NAME_FIELD = MIN_1_LEN.max(USER_NAME_MAX_LEN);
export const PWD_FIELD = MIN_1_LEN.max(PWD_MAX_LEN);
export const REFER_FIELD = MIN_1_LEN.max(REFER_MAX_LEN);
export const TAG_FIELD = MIN_1_LEN.max(TAG_MAX_LEN);
export const PGP_FIELD = z.string().max(PGP_MAX_LEN).optional();
export const RANK_FIELD = z.int().min(0).max(2);
export const PFP_URL_FIELD = z.string().max(PFP_URL_MAX_LEN).optional();
export const BIO_FIELD = z.string().max(BIO_MAX_LEN).optional();

// zod sessions / secrets
export const ADMIN_SESSION = z.string().length(ADMIN_SESSION_LEN);
export const DEV_SECRET = MIN_1_LEN.max(512);

// zod request structures / props
export const ACCOUNT_CREATE_BODY_STRUCT = z.object({
    login_name: LOGIN_NAME_FIELD,
    user_name: USER_NAME_FIELD,
    pwd: PWD_FIELD,
    refer: REFER_FIELD
});

export const ADMIN_ACCOUNT_CREATE_BODY_STRUCT = z.object({
    login_name: LOGIN_NAME_FIELD,
    user_name: USER_NAME_FIELD,
    tag: TAG_FIELD,
    pwd: PWD_FIELD,
    pgp: PGP_FIELD,
    rank: RANK_FIELD,
    refer: REFER_FIELD,
    pfp_url: PFP_URL_FIELD,
    bio: BIO_FIELD
});

export const ADMIN_ACCOUNT_CREATE_COOKIE_STRUCT = z.object({
    asid: ADMIN_SESSION
});