import { CronSyntaxType } from "./cron";

const KEY = "CRON_BOOKMARKS";
const storage = JSON.parse(window.localStorage.getItem(KEY) || "{}");

function sync(): void {
  window.localStorage.setItem(KEY, JSON.stringify(storage));
}

function checkKeyMembership(key: string): boolean {
  return key in storage;
}

type StorageOperation<T> = (type: CronSyntaxType, expression: string) => T;

function usingKey<T>(f: (key: string) => T): StorageOperation<T> {
  return (type, expression) => {
    const key = `${type.toUpperCase()}-${expression.toUpperCase()}`;

    return f(key);
  };
}

function applyMembershipUpdate(
  membershipRequirement: boolean,
  f: (key: string) => void
): StorageOperation<void> {
  return usingKey((key) => {
    if (checkKeyMembership(key) !== membershipRequirement) return;

    f(key);

    sync();
  });
}

export const hashBookmark = usingKey((key) => key);
export const checkBookmarkMembership = usingKey(checkKeyMembership);

export const addBookmark = applyMembershipUpdate(
  false,
  (key) => (storage[key] = true)
);

export const removeBookmark = applyMembershipUpdate(
  true,
  (key) => delete storage[key]
);
