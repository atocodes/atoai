import { nanoid } from "nanoid";
export const createNanoId = (length: number = 6) => nanoid(length);
