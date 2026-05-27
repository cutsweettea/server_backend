import { generateResponse } from "../../util.ts";
import type { RouteCallbackProps } from "../registrar.ts";

export function devCreateAccount({ req, res, db }: RouteCallbackProps) {
    const ln: string = req.body.login_name!;
    const usn: string = req.body.user_name!;
    const tag: string = req.body.tag!;
    const pwd: string = req.body.pwd!;
    const pgp: string | undefined = req.body.pgp;
    const rank: number = req.body.rank!;
    const refer: string = req.body.refer!;
    const pfp_url: string | undefined = req.body.pfp_url;
    const bio: string | undefined = req.body.bio;

    console.log(`creating account with ln=${ln}, usn=${usn}, tag=${tag}, pwd=${pwd}, pgp=${pgp}, rank=${rank}, refer=${refer}, pfp_url=${pfp_url}, bio=${bio}`)
    return res.status(400).send(generateResponse(false, 'noppeee'));
}