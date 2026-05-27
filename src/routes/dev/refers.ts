import { generateResponse } from "../../util.ts";
import type { RouteCallbackProps } from "../registrar.ts";

export async function devCreateReferral({ req, res, db }: RouteCallbackProps) {
    const uid: number = req.body.uid;
    const link: string = req.body.link;
    const max_uses: number = req.body.max_uses;

    // create referral
    let create_res;
    try {
        create_res = await db.getDev().getRefers().createRefer(uid, link, max_uses);
    } catch(e) {
        console.log(e);
        return res.status(400).send(generateResponse(false, 'dont think soo'));
    }

    // return 400 if fail or throws error
    if(!create_res) return res.status(400).send(generateResponse(false, 'nopppeeeee'));
    return res.status(200).send(generateResponse(true, 'okay'));
}

export async function devUseReferral({ req, res, db }: RouteCallbackProps) {
    const link: string = req.body.link;

    // use the link and increases uses by 1
    let update_res;
    try {
        update_res = await db.getDev().getRefers().useRefer(link);
    } catch(e) {
        console.error(e);
        return res.status(400).send(generateResponse(false, 'whoops, didnt work'));
    }

    // return 400 if fail or throws error
    if(!update_res) return res.status(400).send(generateResponse(false, 'something went wrong, idk what'));
    return res.status(200).send(generateResponse(true, 'okay'));
}

export async function devSetReferralUses({ req, res, db }: RouteCallbackProps) {
    const link: string = req.body.link;
    const uses: number = req.body.uses;

    // set referral uses amount
    let update_res;
    try {
        update_res = await db.getDev().getRefers().setReferUses(link, uses);
    } catch(e) {
        console.error(e);
        return res.status(400).send(generateResponse(false, 'uh oh! didnt work'));
    }

    // return 400 if fail or throws error
    if(!update_res) return res.status(400).send(generateResponse(false, 'big errors going on here'));
    return res.status(200).send(generateResponse(true, 'okay'));
}