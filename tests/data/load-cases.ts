import boardCases from './board-cases.json';

export interface BoardCase {
  id: string;
  section: string;
  column: string;
  task: string;
  tags: string[];
}

/**
 * Reads the JSON case file and fails fast on malformed or duplicate entries,
 * so a bad case is reported before any browser starts.
 */
export function loadBoardCases(): BoardCase[] {
  const cases = boardCases.cases as BoardCase[];
  const ids = new Set<string>();
  const placements = new Set<string>();

  for (const entry of cases) {
    const hasFields = Boolean(entry.id && entry.section && entry.column && entry.task);
    const hasTags =
      Array.isArray(entry.tags) &&
      entry.tags.length > 0 &&
      entry.tags.every((tag) => typeof tag === 'string' && tag.trim() !== '');

    if (!hasFields || !hasTags) {
      throw new Error(`Invalid board case: ${JSON.stringify(entry)}`);
    }
    if (ids.has(entry.id)) {
      throw new Error(`Duplicate board case id: ${entry.id}`);
    }

    const placement = `${entry.section} / ${entry.column} / ${entry.task}`;
    if (placements.has(placement)) {
      throw new Error(`Duplicate board case: ${placement}`);
    }

    ids.add(entry.id);
    placements.add(placement);
  }

  return cases;
}
