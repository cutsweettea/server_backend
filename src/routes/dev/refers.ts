import { generateResponse } from "../../util.ts";
import type { RouteCallbackProps } from "../registrar.ts";

export async function devCreateReferral({ req, res, db }: RouteCallbackProps) {
    const uid: number = req.body.uid;
    const link: string = req.body.link;
    const max_uses: number = req.body.max_uses;

    let create_res;
    try {
        create_res = await db.getDev().getRefers().createRefer(uid, link, max_uses);
    } catch(e) {
        console.log(e);
        return res.status(400).send(generateResponse(false, 'dont think soo'));
    }

    if(!create_res) return res.status(400).send(generateResponse(false, 'nopppeeeee'));
    return res.status(200).send(generateResponse(true, 'okay'));
}