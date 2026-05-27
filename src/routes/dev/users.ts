import { generateResponse } from "../../util.ts";
import type { RouteCallbackProps } from "../registrar.ts";

export async function devCreateAccount({ req, res, db }: RouteCallbackProps) {
    const ln: string = req.body.login_name!;
    const usn: string = req.body.user_name!;
    const tag: string = req.body.tag!;
    const pwd: string = req.body.pwd!;
    const pgp: string | undefined = req.body.pgp;
    const rank: number = req.body.rank!;
    const refer: string = req.body.refer!;
    const pfp_url: string | undefined = req.body.pfp_url;
    const bio: string | undefined = req.body.bio;

    // attempt to create user
    let create_res;
    try {
        create_res = await db.getUsers().createUser(ln, usn, pwd, refer, rank, tag, pgp, pfp_url, bio);
    } catch(e) {
        console.error(e);
        return res.status(400).send(generateResponse(false, 'ermm no'));
    }

    // return 400 if fail or throws error
    if(!create_res) {
        console.error('failed creating account');
        return res.status(400).send(generateResponse(false, 'dont think so, maybe next time'));
    }

    return res.status(400).send(generateResponse(true, 'okay'));
}