export const FONTS = {
  inter: "'Inter', sans-serif",
  serif: "'Libre Baskerville', Georgia, serif",
};

export const COLUMNS = [
  { id: 'ideas',     label: 'Scratchpad' },
  { id: 'drafts',    label: 'Drafts' },
  { id: 'finalized', label: 'Published' },
];

export const COLUMN_IDS = COLUMNS.map(c => c.id);

export const COLUMN_LABELS = Object.fromEntries(COLUMNS.map(c => [c.id, c.label]));

