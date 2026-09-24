import { reduceQuery } from './policy';

export interface Viewer {
  open(slug: string, trigger?: HTMLElement | null): boolean;
  close(): void;
  readonly openSlug: string | null;
}

interface Current {
  slug: string;
  dialog: HTMLDialogElement;
  trigger: HTMLElement | null;
}

/**
 * In-place exhibit viewer. Opening adds a history entry so the browser's Back
 * closes it; closing always returns focus to whatever opened it.
 */
export function createViewer(onChange: (open: boolean) => void): Viewer {
  const dialogs = new Map<string, HTMLDialogElement>();
  document.querySelectorAll<HTMLDialogElement>('dialog[data-exhibit-viewer]').forEach((dialog) => {
    dialogs.set(dialog.dataset.exhibitViewer ?? '', dialog);
  });
  let current: Current | null = null;
  // Whether this document pushed the viewer's history entry. A viewer restored
  // by returning from another page closes in place instead of stepping back.
  let pushedHere = false;

  const track = (dialog: HTMLDialogElement) => dialog.querySelector<HTMLElement>('[data-viewer-track]');
  const slides = (dialog: HTMLDialogElement) => Array.from(dialog.querySelectorAll<HTMLElement>('[data-viewer-slide]'));
  const indexOf = (dialog: HTMLDialogElement): number => {
    const element = track(dialog);
    if (!element || element.clientWidth === 0) return 0;
    return Math.round(element.scrollLeft / element.clientWidth);
  };
  const present = (dialog: HTMLDialogElement): void => {
    const count = slides(dialog).length;
    const index = Math.min(count - 1, Math.max(0, indexOf(dialog)));
    const counter = dialog.querySelector<HTMLElement>('[data-viewer-count]');
    if (counter) counter.textContent = `${index + 1} / ${count}`;
    dialog.querySelectorAll<HTMLButtonElement>('[data-viewer-step]').forEach((button) => {
      const step = Number(button.dataset.viewerStep);
      // aria-disabled, not disabled: a focused button that became disabled would drop keyboard focus.
      button.setAttribute('aria-disabled', String(step < 0 ? index === 0 : index === count - 1));
    });
    slides(dialog).forEach((slide, slideIndex) => slide.setAttribute('aria-hidden', String(slideIndex !== index)));
  };
  const step = (dialog: HTMLDialogElement, direction: number): void => {
    const element = track(dialog);
    if (!element) return;
    const next = Math.min(slides(dialog).length - 1, Math.max(0, indexOf(dialog) + direction));
    element.scrollTo({ left: next * element.clientWidth, behavior: reduceQuery.matches ? 'auto' : 'smooth' });
  };

  const show = (slug: string, trigger: HTMLElement | null, push: boolean): boolean => {
    const dialog = dialogs.get(slug);
    if (!dialog) return false;
    if (current?.slug === slug) return true;
    if (current) hide(false);
    current = { slug, dialog, trigger };
    dialog.showModal();
    document.documentElement.dataset.viewer = slug;
    const element = track(dialog);
    if (element) element.scrollLeft = 0;
    present(dialog);
    dialog.querySelector<HTMLElement>('[data-viewer-close]')?.focus({ preventScroll: true });
    if (push) {
      history.pushState({ ...(history.state ?? {}), exhibitViewer: slug }, '');
      pushedHere = true;
    }
    onChange(true);
    return true;
  };

  function hide(restoreFocus = true): void {
    if (!current) return;
    const { dialog, trigger } = current;
    current = null;
    if (dialog.open) dialog.close();
    delete document.documentElement.dataset.viewer;
    if (restoreFocus && trigger?.isConnected) {
      trigger.focus({ preventScroll: true });
      // Closing a dialog restores focus to whatever held it before opening,
      // which can land after this call; confirm the trigger once it settles.
      window.setTimeout(() => {
        if (!current && trigger.isConnected && document.activeElement !== trigger) trigger.focus({ preventScroll: true });
      }, 0);
    }
    onChange(false);
  }

  const close = (): void => {
    if (!current) return;
    const state = history.state as { exhibitViewer?: string } | null;
    if (state?.exhibitViewer === current.slug && pushedHere) {
      // Unwind our own entry so the close button and the browser's Back agree.
      history.back();
      return;
    }
    if (state?.exhibitViewer) {
      const { exhibitViewer: _closed, ...rest } = state;
      history.replaceState(Object.keys(rest).length ? rest : null, '');
    }
    hide();
  };

  for (const dialog of dialogs.values()) {
    dialog.addEventListener('cancel', (event) => { event.preventDefault(); close(); });
    dialog.addEventListener('click', (event) => {
      // A click on the backdrop lands on the dialog element itself.
      if (event.target === dialog) close();
    });
    dialog.querySelectorAll<HTMLElement>('[data-viewer-close]').forEach((button) => button.addEventListener('click', close));
    dialog.querySelectorAll<HTMLButtonElement>('[data-viewer-step]').forEach((button) => {
      button.addEventListener('click', () => {
        if (button.getAttribute('aria-disabled') !== 'true') step(dialog, Number(button.dataset.viewerStep));
      });
    });
    dialog.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();
        step(dialog, event.key === 'ArrowRight' ? 1 : -1);
      }
    });
    let pending = 0;
    track(dialog)?.addEventListener('scroll', () => {
      if (pending) return;
      pending = requestAnimationFrame(() => { pending = 0; present(dialog); });
    }, { passive: true });
  }

  document.addEventListener('click', (event) => {
    const target = event.target as Element | null;
    const button = target?.closest<HTMLElement>('[data-view-exhibit]');
    if (button) {
      event.preventDefault();
      show(button.dataset.viewExhibit ?? '', button, true);
      return;
    }
    // In the catalogue the screenshot itself is a pointer shortcut to the same viewer.
    const figure = target?.closest<HTMLElement>('[data-view-figure]');
    if (!figure || event.button !== 0) return;
    const slug = figure.dataset.viewFigure ?? '';
    const placardButton = figure.closest('[data-stop]')?.querySelector<HTMLElement>('[data-view-exhibit]') ?? null;
    show(slug, placardButton, true);
  });
  window.addEventListener('popstate', (event) => {
    const slug = (event.state as { exhibitViewer?: string } | null)?.exhibitViewer;
    if (slug && dialogs.has(slug)) show(slug, current?.trigger ?? null, false);
    else hide();
  });
  // Returning to a history entry that had the viewer open restores it.
  const initial = (history.state as { exhibitViewer?: string } | null)?.exhibitViewer;
  if (initial && dialogs.has(initial)) {
    const trigger = document.querySelector<HTMLElement>(`[data-view-exhibit="${CSS.escape(initial)}"]`);
    queueMicrotask(() => show(initial, trigger, false));
  }
  for (const button of document.querySelectorAll<HTMLElement>('[data-view-exhibit]')) button.hidden = false;

  return {
    open: (slug, trigger = null) => show(slug, trigger, true),
    close,
    get openSlug() { return current?.slug ?? null; },
  };
}
