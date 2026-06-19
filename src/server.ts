import express from "express";
import RouteRegistrar from "./routes/registrar.ts";
import conf from "./config.ts";
import cookieParser from "cookie-parser";
import { generateResponse } from "./util.ts";
import Database from "./db/database.ts";
import {
  defCreateAccount,
  defGetUser,
  defUpdateUser,
} from "./routes/default/users.ts";
import { adminCreateAccount } from "./routes/admin/users.ts";
import z from "zod";
import {
  ADMIN_ACCOUNT_CREATE_BODY_STRUCT,
  ACCOUNT_CREATE_BODY_STRUCT,
  ADMIN_REFER_CREATE_BODY_STRUCT,
  DEV_REFER_USE_BODY_STRUCT,
  DEV_REFER_SET_BODY_STRUCT,
  ACCOUNT_LOGIN_BODY_STRUCT,
  ACCOUNT_LOGIN_FAIL,
  ACCESS_FAIL,
  ACCOUNT_GET_FAIL,
  ACCOUNT_EDIT_BODY_STRUCT,
  X_AUTHENTICATION_HEADER,
} from "./consts.ts";
import { devCreateAccount } from "./routes/dev/users.ts";
import {
  devCreateReferral,
  devSetReferralUses,
  devUseReferral,
} from "./routes/dev/refers.ts";
import cors from "cors";
import {
  defLogin,
  defAccess,
  defLevelAccess,
  defLogout,
} from "./routes/default/sessions.ts";

// setup server and middleware
const serv = express();
serv.use(express.json({ limit: "25kb" }));
serv.use(cookieParser(conf.cookieSecret));
serv.use(
  cors({
    origin: conf.prod ? "https://divine.frl" : "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
  }),
);
serv.use((req, res, next) => {
  const auth_header = req.headers[X_AUTHENTICATION_HEADER];
  if (typeof auth_header !== "string") {
    next();
    return;
  }

  const ahspl = auth_header.split("_");
  const method = ahspl[0];
  const auth = ahspl[1];
  if (!method || !auth) {
    next();
    return;
  }

  console.log(`${method} w/ ${auth}`);
  next();
});

// setup db
const db = new Database();

// setup routes
const rr = new RouteRegistrar(serv, db);

async function registerRoutes() {
  // for-production routes

  // account creation
  await rr.post({
    path: "/account/create",
    defCallbackOpts: {
      callback: defCreateAccount,
      requiredBodyValues: ACCOUNT_CREATE_BODY_STRUCT,
    },
  });

  await rr.post({
    path: "/account/login",
    defCallbackOpts: {
      callback: defLogin,
      requiredBodyValues: ACCOUNT_LOGIN_BODY_STRUCT,
    },
    genericResponse: ACCOUNT_LOGIN_FAIL,
  });

  await rr.post({
    path: "/account/get",
    defCallbackOpts: {
      callback: defGetUser,
    },
    genericResponse: ACCOUNT_GET_FAIL,
  });

  await rr.post({
    path: "/account/edit",
    defCallbackOpts: {
      callback: defUpdateUser,
      requiredBodyValues: ACCOUNT_EDIT_BODY_STRUCT,
    },
  });

  await rr.get({
    path: "/account/logout",
    defCallbackOpts: {
      callback: defLogout,
    },
  });

  await rr.get({
    path: "/access",
    defCallbackOpts: {
      callback: defAccess,
    },
    genericResponse: ACCESS_FAIL,
  });

  await rr.get({
    path: "/access/:level",
    defCallbackOpts: {
      callback: defLevelAccess,
    },
    genericResponse: ACCESS_FAIL,
  });

  // non-production routes
  await rr.post({
    path: "/dev/account/create",
    defCallbackOpts: {
      callback: devCreateAccount,
      requiredBodyValues: ADMIN_ACCOUNT_CREATE_BODY_STRUCT,
    },
    dev: true,
  });

  await rr.post({
    path: "/dev/refer/create",
    defCallbackOpts: {
      callback: devCreateReferral,
      requiredBodyValues: ADMIN_REFER_CREATE_BODY_STRUCT,
    },
    dev: true,
  });

  await rr.post({
    path: "/dev/refer/use",
    defCallbackOpts: {
      callback: devUseReferral,
      requiredBodyValues: DEV_REFER_USE_BODY_STRUCT,
    },
    dev: true,
  });

  await rr.post({
    path: "/dev/refer/set_uses",
    defCallbackOpts: {
      callback: devSetReferralUses,
      requiredBodyValues: DEV_REFER_SET_BODY_STRUCT,
    },
    dev: true,
  });
}

registerRoutes();

serv.listen(conf.port, () => {
  console.log(`listening on port ${conf.port} with prod=${conf.prod}`);
  console.log(`registered ${rr.routeCount()} routes`);
});
