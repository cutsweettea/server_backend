import { generateResponse } from "../../util.ts";
import type { RouteCallbackProps } from "../registrar.ts";

export async function defCreateAccount({ req, res, db }: RouteCallbackProps) {
    const ln: string = req.body.login_name!;
    const usn: string = req.body.user_name!;
    const pwd: string = req.body.pwd!;
    const refer: string = req.body.refer!;
    
    // attempt to create user
    let salt;
    try {
        salt = await db.getUsers().createUser(ln, usn, pwd, refer);
    } catch(e) {
        return res.status(400).send(generateResponse(false, e));
    }

    return res.status(200).send(generateResponse(true, salt));
}