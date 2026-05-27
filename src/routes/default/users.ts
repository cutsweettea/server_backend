import { generateResponse } from "../../util.ts";
import type { RouteCallbackProps } from "../registrar.ts";

export async function defCreateAccount({ req, res, db }: RouteCallbackProps) {
    const ln: string = req.body.login_name!;
    const usn: string = req.body.user_name!;
    const pwd: string = req.body.pwd!;
    const refer: string = req.body.refer!;
    console.log(`creating account with ln=${ln}, usn=${usn}, pwd=${pwd}, refer=${refer}`);

    return res.status(400).json(generateResponse(false, 'ntnt'));
}