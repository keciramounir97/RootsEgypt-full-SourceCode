/** E.164 for tel: set VITE_CONTACT_PHONE in .env */
const fromEnv = import.meta.env.VITE_CONTACT_PHONE?.replace(/\s/g, "") ?? "";

export const CONTACT_PHONE_TEL =
  fromEnv.length > 0
    ? fromEnv.startsWith("+")
      ? fromEnv
      : `+${fromEnv}`
    : "+201000000000";

export const CONTACT_PHONE_DISPLAY =
  import.meta.env.VITE_CONTACT_PHONE_DISPLAY ?? "+20 10 0000 0000";
