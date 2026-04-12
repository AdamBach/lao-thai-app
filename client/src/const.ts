export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const getLoginUrl = () => {
  // Return home if OAuth not configured
  return "/";
};