export const setCookie = (name: string, value: string, expDays: number, path: string) => {
  let date = new Date();
  date.setTime(date.getTime() + expDays * 1000);
  const expires = 'expires=' + date.toUTCString();
  let cookie = `${name}=${encodeURIComponent(value)}; ${expires}; path=${path}`;
  document.cookie = cookie;
};
export const deleteCookie = (name: string, path: string) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`;
};
export const getCookie = (name: string) => {
  const cookie = decodeURIComponent(document.cookie);
  for (let x of cookie.split('; ')) {
    const [key, value] = x.split('=');
    if (name === key) return value;
  }
};
export const getTime = () => new Date().getTime() / 1000;
