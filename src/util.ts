import * as argon2 from 'argon2';

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