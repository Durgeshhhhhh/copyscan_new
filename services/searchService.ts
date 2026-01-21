import { UserDocument, PlagiarismResult, ComparisonResult } from "../types";

/**
 * TAVILY SEARCH CONFIGURATION
 */
const TAVILY_API_KEY = "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";

/**
 * Normalizes text for comparison
 */
const normalize = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/**
 * Similarity engine
 */
const calculateSimilarity = (input: string, target: string): number => {
  const cleanInput = normalize(input);
  const cleanTarget = normalize(target);

  const words1 = cleanInput.split(" ").filter(w => w.length > 2);
  const words2 = cleanTarget.split(" ").filter(w => w.length > 2);

  if (!words1.length || !words2.length) return 0;

  const set1 = new Set(words1);
  const set2 = new Set(words2);

  const intersection = [...set1].filter(x => set2.has(x));
  const union = new Set([...set1, ...set2]);

  const jaccard = intersection.length / union.size;

  let sequenceMatch = 0;
  const phraseLength = 4;

  if (words1.length >= phraseLength) {
    let matches = 0;
    const sampleSize = Math.min(words1.length - phraseLength + 1, 15);

    for (let i = 0; i < sampleSize; i++) {
      const phrase = words1.slice(i, i + phraseLength).join(" ");
      if (cleanTarget.includes(phrase)) matches++;
    }
    sequenceMatch = matches / sampleSize;
  }

  const score = jaccard * 0.3 + sequenceMatch * 0.7;
  return Math.min(100, Math.round(score * 100 * 2.5));
};

/**
 * Search-friendly chunks
 */
const getSearchQueries = (text: string): string[] => {
  const words = text.split(/\s+/).filter(w => w.length > 3);
  if (!words.length) return [];

  const queries: string[] = [];
  queries.push(words.slice(0, 8).join(" "));

  if (words.length >= 30) {
    const mid = Math.floor(words.length / 2);
    queries.push(words.slice(mid, mid + 8).join(" "));
  }
  return queries;
};

/**
 * Highlight generator
 */
const generateHighlights = (text: string, sources: any[]): string => {
  if (!sources.length) return text;

  const tokens = text.split(/(\s+|[.!?,"';:()]+)/);
  const sourcePool = sources.map(s =>
    normalize(`${s.snippet || ""} ${s.title || ""} ${s.content || ""}`)
  );

  const matchedTokenIndices = new Set<number>();
  const windowSize = 3;

  const cleanWords = tokens.map(t => normalize(t));

  for (let i = 0; i <= cleanWords.length - windowSize; i++) {
    const phrase = cleanWords.slice(i, i + windowSize).join(" ");
    if (sourcePool.some(src => src.includes(phrase))) {
      for (let j = i; j < i + windowSize; j++) {
        matchedTokenIndices.add(j);
      }
    }
  }

  let html = "";
  let open = false;

  tokens.forEach((token, i) => {
    const match = matchedTokenIndices.has(i);

    if (match && !open) {
      html += `<mark class="bg-red-100 text-red-700 px-0.5 rounded-sm font-semibold">`;
      open = true;
    } else if (!match && open) {
      html += `</mark>`;
      open = false;
    }
    html += token;
  });

  if (open) html += `</mark>`;
  return html;
};

/**
 * MAIN PLAGIARISM CHECK
 */
export const checkPlagiarism = async (
  text: string,
  vaultDocs: UserDocument[] = [],
  includeWeb = true
): Promise<PlagiarismResult> => {
  if (!text || text.trim().length < 20) {
    return { score: 0, summary: "Input too short for scan.", sources: [] };
  }

  const WEB_SIMILARITY_THRESHOLD = 15;

  const vaultMatches = vaultDocs
    .map(doc => ({
      title: doc.title,
      url: `internal://vault/${doc.ownerId}/${doc.id}`,
      content: doc.content,
      isPrivate: true,
      score: calculateSimilarity(text, doc.content)
    }))
    .filter(m => m.score > 5);

  const webSources: any[] = [];

  if (includeWeb && TAVILY_API_KEY) {
    const queries = getSearchQueries(text);

    for (const query of queries) {
      try {
        const response = await fetch("https://api.tavily.com/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            api_key: TAVILY_API_KEY,
            query,
            search_depth: "advanced",
            include_raw_content: false,
            max_results: 5
          })
        });

        const data = await response.json();

        if (data?.results) {
          data.results.forEach((item: any) => {
            const score = calculateSimilarity(
              text,
              `${item.title || ""} ${item.content || ""}`
            );

            if (score >= WEB_SIMILARITY_THRESHOLD) {
              webSources.push({
                title: item.title,
                url: item.url,
                snippet: item.content,
                isPrivate: false,
                score
              });
            }
          });
        }
      } catch (e) {
        console.warn("Tavily search failed, continuing...");
      }
    }
  }

  const allMatches = [...vaultMatches, ...webSources].sort(
    (a, b) => b.score - a.score
  );

  const uniqueMatches = allMatches.filter(
    (v, i, a) => a.findIndex(t => t.url === v.url) === i
  );

  const topScore = uniqueMatches.length
    ? Math.max(...uniqueMatches.map(m => m.score))
    : 0;

  const highlightedHtml = generateHighlights(text, uniqueMatches);

  return {
    score: Math.min(100, topScore),
    summary:
      topScore > 60
        ? `High similarity detected (${topScore}%).`
        : `Scan complete: ${topScore}% similarity found.`,
    highlightedHtml,
    sources: uniqueMatches.map(({ title, url, score, isPrivate }) => ({
      title,
      url,
      score,
      isPrivate
    }))
  };
};

/**
 * TEXT-TO-TEXT COMPARISON (unchanged)
 */
export const compareTexts = async (
  textA: string,
  textB: string
): Promise<ComparisonResult> => {
  const score = calculateSimilarity(textA, textB);

  const normalizeSet = (t: string) =>
    new Set(normalize(t).split(" ").filter(w => w.length > 1));

  const setA = normalizeSet(textA);
  const setB = normalizeSet(textB);

  const highlight = (text: string, set: Set<string>) =>
    text
      .split(/(\s+)/)
      .map(w =>
        set.has(normalize(w))
          ? `<mark class="bg-amber-100 px-0.5 rounded-sm">${w}</mark>`
          : w
      )
      .join("");

  return {
    score,
    summary:
      score > 50
        ? "High overlap detected."
        : "Low overlap with some shared terms.",
    highlightedTextA: highlight(textA, setB),
    highlightedTextB: highlight(textB, setA)
  };
};
