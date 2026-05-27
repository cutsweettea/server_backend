import { randomBytes } from 'crypto';
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
        parallelism: 1
    })).toString();
}

export const defaultVerify = async (hash: string, text: string): Promise<boolean> => {
    return await argon2.verify(hash, text);
}

export const genRandom = (len: number) => {
    return randomBytes(len / 2).toString('hex');
}