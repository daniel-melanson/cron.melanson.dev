export function createSnackbar(status: "success" | "failure", message: string) {
  const container = document.getElementById(
    "snackbar-container"
  ) as HTMLDivElement;

  const snackbar = document.createElement("p");

  snackbar.textContent = message;
  snackbar.classList.add("snackbar-item", status);

  container.appendChild(snackbar);

  setTimeout(() => (snackbar.style.opacity = "0"), 2000);
  setTimeout(() => {
    container.removeChild(snackbar);
  }, 4000);
}
