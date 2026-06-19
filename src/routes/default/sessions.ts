import conf from "../../config.ts";
import {
  ACCESS_FAIL,
  ACCOUNT_LOGIN_FAIL,
  DELETE_SESSION_FAIL,
} from "../../consts.ts";
import { canAccess, generateCookieOpts, generateResponse } from "../../util.ts";
import type { RouteCallbackProps } from "../registrar.ts";

export async function defLogin({ req, res, db }: RouteCallbackProps) {
  const ln: string = req.body.login_name!;
  const pwd: string = req.body.pwd!;
  const salt: string = req.body.salt!;

  console.log("login");
  let sid;
  try {
    sid = await db.getSessions().login(ln, pwd, salt);
  } catch (e) {
    console.log(`err: ${e}`);
    return res.status(400).send(generateResponse(false, ACCOUNT_LOGIN_FAIL));
  }

  return res
    .status(200)
    .cookie("sid", sid, generateCookieOpts())
    .send(generateResponse(true, "okay"));
}

export async function defAccess({ req, res, db }: RouteCallbackProps) {
  const cookies = conf.prod ? req.signedCookies : req.cookies;
  if (!Object.keys(cookies).includes("sid"))
    return res.status(400).send(generateResponse(false, ACCESS_FAIL));
  const sid = cookies["sid"];

  try {
    await db.getSessions().getSession(sid);
  } catch (e) {
    console.log(e);
    return res.status(400).send(generateResponse(false, ACCESS_FAIL));
  }

  return res.status(200).send(generateResponse(true, "success"));
}

export async function defLevelAccess({ req, res, db }: RouteCallbackProps) {
  const cookies = conf.prod ? req.signedCookies : req.cookies;
  if (!Object.keys(cookies).includes("sid"))
    return res.status(400).send(generateResponse(false, ACCESS_FAIL));
  const sid = cookies["sid"];
  const level = req.params.level;

  let user;
  try {
    user = await db.getUsers().getUserFromSession(sid);
  } catch (e) {
    console.log(e);
    return res.status(400).send(generateResponse(false, ACCESS_FAIL));
  }

  if (!canAccess(user.rank, Number(level)))
    return res.status(400).send(generateResponse(false, ACCESS_FAIL));
  return res.status(200).send(generateResponse(true, "success"));
}

export async function defLogout({ req, res, db }: RouteCallbackProps) {
  const cookies = conf.prod ? req.signedCookies : req.cookies;
  if (!Object.keys(cookies).includes("sid"))
    return res.status(400).send(generateResponse(false, ACCESS_FAIL));
  const sid = cookies["sid"];

  try {
    await db.getSessions().deleteSession(sid);
  } catch (e) {
    console.log(e);
    return res.status(400).send(generateResponse(false, DELETE_SESSION_FAIL));
  }

  return res.status(200).send(generateResponse(true, "okay"));
}
