/** E.164 for tel: set VITE_CONTACT_PHONE in .env */
const fromEnv = import.meta.env.VITE_CONTACT_PHONE?.replace(/\s/g, "") ?? "";

export const CONTACT_PHONE_TEL =
  fromEnv.length > 0
    ? fromEnv.startsWith("+")
      ? fromEnv
      : `+${fromEnv}`
    : "+9613626082";

export const CONTACT_PHONE_DISPLAY =
  import.meta.env.VITE_CONTACT_PHONE_DISPLAY ?? "+961 36 26 082";

export const CONTACT_WHATSAPP_TEL =
  import.meta.env.VITE_CONTACT_WHATSAPP?.replace(/\s/g, "") ||
  CONTACT_PHONE_TEL;

export const CONTACT_WHATSAPP_DISPLAY =
  import.meta.env.VITE_CONTACT_WHATSAPP_DISPLAY ?? CONTACT_PHONE_DISPLAY;
