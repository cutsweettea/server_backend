import conf from "../../config.ts";
import { ACCOUNT_LOGIN_FAIL } from "../../consts.ts";
import { generateCookieOpts, generateResponse } from "../../util.ts";
import type { RouteCallbackProps } from "../registrar.ts";

export default async function defLogin({ req, res, db }: RouteCallbackProps) {
    const ln: string = req.body.login_name!;
    const pwd: string = req.body.pwd!;
    const salt: string = req.body.salt!;

    console.log('login');
    let sid;
    try {
        sid = await db.getSessions().login(ln, pwd, salt);
    } catch(e) {
        console.log(`err: ${e}`);
        return res.status(400).send(generateResponse(false, ACCOUNT_LOGIN_FAIL));
    }

    return res.status(200).cookie('sid', sid, generateCookieOpts()).send(generateResponse(true, 'okay'));
}