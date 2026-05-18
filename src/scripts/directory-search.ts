import Fuse from 'fuse.js';
import type { ToolEntry, ToolInventory } from '../data/tool-inventory.schema';

declare global {
  interface Window {
    plausible?: (event: string, opts?: { props?: Record<string, string> }) => void;
  }
}

/**
 * Pure search function — used directly by tests, also driven by initDirectorySearch.
 * Empty query returns all entries that should appear on the directory grid.
 */
export function search(inventory: ToolInventory, query: string): ToolEntry[] {
  const visible = inventory.filter(t => t.appears_on_directory);
  if (!query.trim()) return visible;
  const fuse = new Fuse(visible, {
    keys: ['title', 'description', 'synonyms'],
    threshold: 0.4,
    includeScore: false,
    ignoreLocation: true,
  });
  return fuse.search(query).map(r => r.item);
}

/**
 * Browser-only setup. Reads the inventory from the embedded JSON, wires search + cat-tabs,
 * fires a Plausible event for each non-trivial search.
 */
export function initDirectorySearch(): void {
  if (typeof document === 'undefined') return;

  const dataNode = document.getElementById('directory-inventory');
  if (!dataNode) return;
  const inventory = JSON.parse(dataNode.textContent || '[]') as ToolInventory;

  const input = document.getElementById('directory-search-input') as HTMLInputElement | null;
  const tabs = document.getElementById('directory-cat-tabs');
  const grid = document.getElementById('directory-grid');
  if (!input || !tabs || !grid) return;

  let currentCategory: string = 'all';

  // Keyboard shortcut: "/" focuses the search input (when not already in a text input)
  document.addEventListener('keydown', (e) => {
    if (e.key !== '/') return;
    const target = e.target as HTMLElement;
    if (target.matches('input, textarea, [contenteditable="true"]')) return;
    e.preventDefault();
    input.focus();
  });

  function render() {
    const query = input!.value;
    const searched = search(inventory, query);
    const filtered = currentCategory === 'all'
      ? searched
      : searched.filter(t => t.source_app === currentCategory);

    const visibleIds = new Set(filtered.map(t => t.id));
    grid!.querySelectorAll<HTMLElement>('.card').forEach((card) => {
      const id = card.dataset.toolId;
      card.style.display = id && visibleIds.has(id) ? '' : 'none';
    });
  }

  input.addEventListener('input', () => {
    render();
  });

  // Debounced Plausible event — only fire after the user pauses for 800ms with >= 2 chars
  let plausibleTimeout: number | undefined;
  input.addEventListener('input', () => {
    if (plausibleTimeout) window.clearTimeout(plausibleTimeout);
    const q = input!.value.trim();
    if (q.length < 2) return;
    plausibleTimeout = window.setTimeout(() => {
      window.plausible?.('Search', { props: { query: q.slice(0, 100) } });
    }, 800);
  });

  tabs.querySelectorAll<HTMLButtonElement>('.cat-tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      tabs!.querySelectorAll('.cat-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.dataset.category || 'all';
      render();
    });
  });
}
