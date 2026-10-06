type RouterLike = { refresh: () => void };

/** Re-render the current route after a server action has finished. */
export function refreshSoon(router: RouterLike): void {
  router.refresh();
}
