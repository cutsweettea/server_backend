import conf from "../../config.ts";
import { ACCOUNT_LOGIN_FAIL, X_AUTHENTICATION_HEADER } from "../../consts.ts";
import ss from "../../server.ts";
import {
  defaultHash,
  defaultVerify,
  extractSalt,
  generateResponse,
} from "../../util.ts";
import { type RouteCallbackProps } from "../registrar.ts";

export async function defCreateDiscordRef({
  req,
  res,
  db,
}: RouteCallbackProps) {
  const auth_header = req.headers[X_AUTHENTICATION_HEADER];
  if (typeof auth_header !== "string") return res.sendStatus(400);

  const ahspl = auth_header.split("_");
  const method = ahspl[0];
  const auth = ahspl[1];

  if (!method || !auth) return res.sendStatus(400);
  if (method != "discord") return res.sendStatus(400);

  let verified;
  try {
    verified = await defaultVerify(conf.discordSecret, auth);
  } catch (e) {
    return res.sendStatus(400);
  }

  if (!verified) {
    console.log("failed verify");
    return res.sendStatus(400);
  }

  const uid = req.body.uid!;
  const usn = req.body.usn!;
  if (typeof uid !== "string" || typeof usn !== "string") {
    console.log("not str");
    return res.status(400);
  }

  let ref;
  try {
    ref = await db.getDiscord().createRef({
      id: uid,
      username: usn,
    });
  } catch (e) {
    return res.sendStatus(400);
  }

  const link = conf.prod
    ? `https://divine.frl/discord/login/${ref}`
    : `http://localhost:5173/discord/login/${ref}`;
  return res.status(200).send(link);
}

export async function defAuthorizeDiscordRef({
  req,
  res,
  db,
}: RouteCallbackProps) {
  const ln: string = req.body.login_name!;
  const pwd: string = req.body.pwd!;
  const salt: string = req.body.salt!;
  const ref: string = req.body.ref!;

  const sock_id = ss.getSRM()[ref];
  if (!sock_id) {
    console.log("no sock id");
    return res.status(400).send(generateResponse(false, ACCOUNT_LOGIN_FAIL));
  }

  console.log(`sock_id: ${sock_id}`);
  const socket = ss.getIO().to(sock_id);

  const sessions = db.getSessions();
  let sid;
  try {
    sid = await sessions.login(ln, pwd, salt);
  } catch (e) {
    console.log(e);

    socket.emit("respond", false);
    return res.status(400).send(generateResponse(false, ACCOUNT_LOGIN_FAIL));
  }

  let sesh;
  try {
    sesh = await sessions.getSession(sid);
  } catch (e) {
    console.log(e);
    socket.emit("respond", false);
    return res.status(400).send(generateResponse(false, ACCOUNT_LOGIN_FAIL));
  }

  const users = db.getUsers();
  let user;
  try {
    user = await users.getUser(sesh.uid);
  } catch (e) {
    console.log(e);
    socket.emit("respond", false);
    return res.status(400).send(generateResponse(false, ACCOUNT_LOGIN_FAIL));
  }

  try {
    await sessions.deleteSession(sid);
  } catch (e) {
    console.log(e);
    socket.emit("respond", false);
    return res.status(400).send(generateResponse(false, ACCOUNT_LOGIN_FAIL));
  }

  const discord = db.getDiscord();
  let disc_ref;
  try {
    disc_ref = await discord.getRef(ref);
  } catch (e) {
    console.log(e);
    socket.emit("respond", false);
    return res.status(400).send(generateResponse(false, ACCOUNT_LOGIN_FAIL));
  }

  const hash = await defaultHash(disc_ref.info.id);
  const hash_info = await extractSalt(hash);
  try {
    await users.editUserDiscordHash(user.id, hash_info.hash);
  } catch (e) {
    console.log(e);
    socket.emit("respond", false);
    return res.status(400).send(generateResponse(false, ACCOUNT_LOGIN_FAIL));
  }

  const username = disc_ref.info.username;
  try {
    await discord.deleteRef(ref);
  } catch (e) {
    console.log(e);
    socket.emit("respond", false);
    return res.status(400).send(generateResponse(false, ACCOUNT_LOGIN_FAIL));
  }

  socket.emit("respond", true);
  return res
    .status(200)
    .send(generateResponse(true, `authorized as ${username}`));
}
