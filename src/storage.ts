const KEY = "CRON_BOOKMARKS";
const storage = JSON.parse(window.localStorage.getItem(KEY) || "{}");

function sync(): void {
  window.localStorage.setItem(KEY, JSON.stringify(storage));
}

export function isBookmarked(key: string): boolean {
  return key in storage;
}

export function addBookmark(key: string): void {
  if (isBookmarked(key)) return;

  storage[key] = true;
  sync();
}

export function removeBookmark(key: string): void {
  if (!isBookmarked(key)) return;

  delete storage[key];
  sync();
}
