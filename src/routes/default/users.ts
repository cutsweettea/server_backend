import { generateResponse } from "../../util.ts";
import type { RouteCallbackProps } from "../registrar.ts";

export function defCreateAccount({ req, res, db }: RouteCallbackProps) {
    return res.status(400).json(generateResponse(false, 'ntnt'));
}