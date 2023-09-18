const KEY = "CRON_BOOKMARKS";
const storage = JSON.parse(window.localStorage.getItem(KEY) || "{}");

function sync(): void {
  window.localStorage.setItem(KEY, JSON.stringify(storage));
}

function checkKeyMembership(key: string): boolean {
  return key in storage;
}

function usingKey<T>(f: (key: string) => T): (value: string) => T {
  return (value) => {
    const key = value.toUpperCase().trim();

    return f(key);
  };
}

function applyMembershipUpdate(
  membershipRequirement: boolean,
  f: (key: string) => void
): (value: string) => void {
  return usingKey((key) => {
    if (checkKeyMembership(key) !== membershipRequirement) return;

    f(key);

    sync();
  });
}

export const hashBookmark = usingKey((key) => key);
export const isBookmarked = usingKey(checkKeyMembership);

export const addBookmark = applyMembershipUpdate(
  false,
  (key) => (storage[key] = true)
);

export const removeBookmark = applyMembershipUpdate(
  true,
  (key) => delete storage[key]
);
