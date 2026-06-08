import conf from "../../config.ts";
import { ACCOUNT_GET_FAIL } from "../../consts.ts";
import type { FilteredUserProps, UserProps } from "../../db/interfaces.ts";
import { filterUserData, generateResponse } from "../../util.ts";
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

export async function defGetUser({ req, res, db }: RouteCallbackProps) {
    const usn: string = req.body.user_name!;
    const cookies = conf.prod ? req.signedCookies : req.cookies;

    let current_user: UserProps = {
        bio: null,
        created: new Date(),
        id: -1,
        login_name: '',
        pfp_url: '',
        pgp: null,
        pwd_hash: '',
        rank: -1,
        refer: '',
        tag: '',
        user_name: ''
    };

    if(Object.keys(cookies).includes('sid')) {
        const sid = cookies['sid'];
        try {
            current_user = await db.getUsers().getUserFromSession(sid);
        } catch(e) {
            console.log(e);
        }
    }

    // attempt to get user
    let get_user: UserProps;
    try {
        get_user = await db.getUsers().getUserByUsername(usn);
    } catch(e) {
        console.log(e);
        return res.status(400).send(generateResponse(false, ACCOUNT_GET_FAIL));
    }

    let user: FilteredUserProps = filterUserData(get_user, current_user);
    return res.status(200).send(generateResponse(true, user));
}