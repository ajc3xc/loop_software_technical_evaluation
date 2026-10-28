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

  for (const entry of cases) {
    const isComplete =
      Boolean(entry.id && entry.section && entry.column && entry.task) &&
      Array.isArray(entry.tags) &&
      entry.tags.length > 0;

    if (!isComplete) {
      throw new Error(`Invalid board case: ${JSON.stringify(entry)}`);
    }
    if (ids.has(entry.id)) {
      throw new Error(`Duplicate board case id: ${entry.id}`);
    }
    ids.add(entry.id);
  }

  return cases;
}
