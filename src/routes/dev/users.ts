import { generateResponse } from "../../util.ts";
import type { RouteCallbackProps } from "../registrar.ts";

export function devCreateAccount({ req, res, db }: RouteCallbackProps) {
    return res.status(400).send(generateResponse(false, 'poofart'));
}