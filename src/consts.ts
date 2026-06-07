import z from 'zod';

// schema consts

export const LOGIN_NAME_MAX_LEN = 32;
export const USER_NAME_MAX_LEN = 32;
export const PWD_MIN_LEN = 8;
export const PWD_MAX_LEN = 256;
export const PWD_HASH_MAX_LEN = 128;
export const REFER_MAX_LEN = 16;
export const PFP_URL_MAX_LEN = 128;
export const BIO_MAX_LEN = 500;
export const PGP_MAX_LEN = 2000;
export const TAG_MAX_LEN = 4;
export const REG_LINK_MAX_LEN = 16;
export const UID_MAX = 999999;
export const MAX_MAX_USES = 100;
export const SALT_MAX_LEN = 16;

// session ident / secret constants
export const SESSION_ID_LEN = 32;
export const ADMIN_SESSION_ID_LEN = 64;
export const SESSION_NAME_MAX_LEN = 32;
export const DEV_SECRET_MAX_LEN = 512;

// zod consts

// zod props
export const LOGIN_NAME_FIELD = z.string({ error: 'login name must be a string' })
    .min(1, { error: 'login name must be > 0 characters' })
    .max(LOGIN_NAME_MAX_LEN, { error: `login name must be <= ${LOGIN_NAME_MAX_LEN} characters` });
export const USER_NAME_FIELD = z.string({ error: 'username must be a string' })
    .min(1, { error: 'username must be > 0 characters' })
    .max(USER_NAME_MAX_LEN, { error: `username must be <= ${USER_NAME_MAX_LEN} characters` });
export const PWD_FIELD = z.string({ error: 'pwd must be a string' })
    .min(PWD_MIN_LEN, { error: `password must be >= ${PWD_MIN_LEN} characters` })
    .max(PWD_MAX_LEN, { error: `password must be <= ${PWD_MAX_LEN} characters` })
    .regex(/[a-z]/, { error: 'password must contain 1 lowercase letter' })
    .regex(/[A-Z]/, { error: 'password must contain 1 uppercase letter' })
    .regex(/[0-9]/, { error: 'password must contain 1 number' })
    .regex(/[!@#$%^&*?]/, { error: 'password must contain 1 special character' });
export const REFER_FIELD = z.string({ error: 'refer must be a string' })
    .min(1, { error: 'refer must be > 0 characters' })
    .max(REFER_MAX_LEN, { error: `refer must be <= ${REFER_MAX_LEN} characters` });
export const TAG_FIELD = z.string({ error: 'tag must be a string' })
    .min(1, { error: 'tag must be > 0 characters' })
    .max(TAG_MAX_LEN, { error: `tag must be <= ${TAG_MAX_LEN} characters` });
export const PGP_FIELD = z.string({ error: 'pgp must be a string' })
    .max(PGP_MAX_LEN, { error: `pgp must be <= ${PGP_MAX_LEN} characters` });
export const RANK_FIELD = z.int({ error: 'rank must be an int' })
    .min(0, { error: 'rank must be a nonzero int' })
    .max(2, { error: `rank must be >= 2` });
export const PFP_URL_FIELD = z.string({ error: 'pfp url must be a string' })
    .max(PFP_URL_MAX_LEN, { error: `pfp url must be <= ${PFP_URL_MAX_LEN} characters` });
export const BIO_FIELD = z.string({ error: 'bio must be a string' })
    .max(BIO_MAX_LEN, { error: `bio must be <= ${BIO_MAX_LEN} characters` });
export const REG_LINK_FIELD = z.string({ error: 'reg link must be a string' })
    .min(1, { error: 'reg link must be > 0 characters' })
    .max(REG_LINK_MAX_LEN, { error: `reg link must be <= ${REG_LINK_MAX_LEN} characters` });
export const UID_FIELD = z.int({ error: 'uid must be an int' })
    .min(0, { error: 'uid must be a nonzero int' })
    .max(UID_MAX, { error: `uid must be <= ${UID_MAX}` });
export const MAX_USES_FIELD = z.int({ error: 'max uses must be an int' })
    .min(0, { error: 'max uses must be a nonzero int' })
    .max(MAX_MAX_USES, { error: `max uses must be <= ${MAX_MAX_USES}` });
export const USES_FIELD = z.int({ error: 'uses must be an int' })
    .min(0, { error: 'uses must be a nonzero int' })
    .max(MAX_MAX_USES, { error: `uses must be <= ${MAX_MAX_USES}` });
export const SALT_FIELD = z.string({ error: 'salt must be a string' })
    .min(1, { error: 'salt must be > 0 characters' })
    .max(SALT_MAX_LEN, { error: `salt must be <= ${SALT_MAX_LEN} characters` });

// zod sessions / secrets
export const ADMIN_SESSION = z.string()
    .length(ADMIN_SESSION_ID_LEN, { error: `admin session id must be ${ADMIN_SESSION_ID_LEN} characters` });
export const DEV_SECRET = z.string()
    .min(0, { error: 'dev secret must be > 0 characters' })
    .max(DEV_SECRET_MAX_LEN, { error: `dev secret must be <= ${DEV_SECRET_MAX_LEN} characters` });

// zod request structures / props
export const ACCOUNT_CREATE_BODY_STRUCT = z.object({
    login_name: LOGIN_NAME_FIELD,
    user_name: USER_NAME_FIELD,
    pwd: PWD_FIELD,
    refer: REFER_FIELD
});

export const ACCOUNT_LOGIN_BODY_STRUCT = z.object({
    login_name: LOGIN_NAME_FIELD,
    pwd: PWD_FIELD,
    salt: SALT_FIELD
});

export const ADMIN_ACCOUNT_CREATE_BODY_STRUCT = z.object({
    login_name: LOGIN_NAME_FIELD,
    user_name: USER_NAME_FIELD,
    tag: TAG_FIELD.optional(),
    pwd: PWD_FIELD,
    pgp: PGP_FIELD.optional(),
    rank: RANK_FIELD.optional(),
    refer: REFER_FIELD,
    pfp_url: PFP_URL_FIELD.optional(),
    bio: BIO_FIELD.optional()
});

export const ADMIN_REFER_CREATE_BODY_STRUCT = z.object({
    uid: UID_FIELD,
    link: REG_LINK_FIELD,
    max_uses: MAX_USES_FIELD
});

export const DEV_REFER_USE_BODY_STRUCT = z.object({
    link: REG_LINK_FIELD
});

export const DEV_REFER_SET_BODY_STRUCT = z.object({
    link: REG_LINK_FIELD,
    uses: USES_FIELD
});

// generic responses
export const ACCOUNT_CREATE_FAIL = 'failed creating account';
export const ACCOUNT_GET_FAIL = 'failed getting account';
export const INVALID_REFERRAL = 'invalid referral';
export const ACCOUNT_LOGIN_FAIL = 'failed to login';
export const ACCESS_FAIL = 'fail';
export const ACCESS_SUCCESS = 'success';
export const SESSION_NOT_FOUND = 'invalid session';