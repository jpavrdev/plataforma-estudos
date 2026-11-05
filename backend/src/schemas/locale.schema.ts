import { z } from "zod";
import { LOCALES } from "../i18n/locale.ts";

export const updateLocaleSchema = z.object({ locale: z.enum(LOCALES) });
