import conf from "../../config.ts";
import {
  ACCOUNT_EDIT_FAIL,
  ACCOUNT_GET_FAIL,
  DEFAULT_THEME,
} from "../../consts.ts";
import type {
  FilteredUserLink,
  FilteredUserProps,
  FullFilteredUserProps,
  UserEditData,
  UserLink,
  UserProps,
  UserSong,
} from "../../db/interfaces.ts";
import {
  filterLinkData,
  filterUserData,
  generateResponse,
} from "../../util.ts";
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
  } catch (e) {
    return res.status(400).send(generateResponse(false, e));
  }

  return res.status(200).send(generateResponse(true, salt));
}

export async function defGetUser({ req, res, db }: RouteCallbackProps) {
  let usn: string | undefined = req.body.user_name;
  const cookies = conf.prod ? req.signedCookies : req.cookies;
  let current_user_updated = false;

  let current_user: UserProps = {
    bio: null,
    created: new Date(),
    id: -1,
    login_name: "",
    pfp_url: "",
    pgp: null,
    pwd_hash: "",
    rank: -1,
    refer: "",
    tag: "",
    user_name: "",
    songs: null,
    theme: DEFAULT_THEME,
  };

  if (Object.keys(cookies).includes("sid")) {
    const sid = cookies["sid"];
    try {
      current_user = await db.getUsers().getUserFromSession(sid);
      current_user_updated = true;
    } catch (e) {
      console.log(e);
    }
  }

  // attempt to get user
  if (!current_user_updated && !usn) {
    console.log("no current user and no username");
    return res.status(400).send(generateResponse(false, ACCOUNT_GET_FAIL));
  }

  if (!usn) usn = current_user.user_name;
  let get_user: UserProps;
  try {
    get_user = await db.getUsers().getUserByUsername(usn);
  } catch (e) {
    console.log(e);
    return res.status(400).send(generateResponse(false, ACCOUNT_GET_FAIL));
  }

  const filtered_user: FilteredUserProps = filterUserData(
    get_user,
    current_user,
  );

  // attempt to get links
  let links: UserLink[];
  try {
    links = await db.getUserLinks().getUserLinks(get_user.id);
  } catch (e) {
    console.log(e);
    return res.status(400).send(generateResponse(false, ACCOUNT_GET_FAIL));
  }

  let filtered_links: FilteredUserLink[] = [];
  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    if (!link) continue;
    filtered_links.push(filterLinkData(link));
  }

  let songs: UserSong[];
  try {
    songs = await db.getUserSongs().getUserSongs(get_user.id);
  } catch (e) {
    console.log(e);
    return res.status(400).send(generateResponse(false, ACCOUNT_GET_FAIL));
  }

  const user: FullFilteredUserProps = {
    ...filtered_user,
    songs,
    links: filtered_links,
  };

  return res.status(200).send(generateResponse(true, user));
}

export async function defUpdateUser({ req, res, db }: RouteCallbackProps) {
  const cookies = conf.prod ? req.signedCookies : req.cookies;
  if (!Object.keys(cookies).includes("sid"))
    return res.status(400).send(generateResponse(false, ACCOUNT_EDIT_FAIL));
  const sid = cookies["sid"];

  let sesh;
  try {
    sesh = await db.getSessions().getSession(sid);
  } catch (e) {
    console.log(e);
    return res.status(400).send(generateResponse(false, ACCOUNT_EDIT_FAIL));
  }

  try {
    await db.getUsers().editUser(sesh.uid, req.body as UserEditData);
  } catch (e) {
    console.log(e);
    return res.status(400).send(generateResponse(false, ACCOUNT_EDIT_FAIL));
  }

  return res.status(200).send(generateResponse(true, "okay"));
}
