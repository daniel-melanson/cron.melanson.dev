export function createSnackbar(message: string) {
  const container = document.getElementById(
    "snackbar-container"
  ) as HTMLDivElement;

  const snackbar = document.createElement("p");

  snackbar.textContent = message;
  container.classList.add("snackbar-item");

  container.appendChild(snackbar);

  setTimeout(() => (snackbar.style.opacity = "0"), 1000);
  setTimeout(() => {
    container.removeChild(snackbar);
  }, 4000);
}
