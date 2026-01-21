
import { UserDocument, PlagiarismResult, ComparisonResult } from "../types";

/**
 * GOOGLE CUSTOM SEARCH CONFIGURATION
 */
const CUSTOM_SEARCH_KEY = "AIzaSyBvrgDtqa8-TW539fGqUS2WqpedtTm_0y8".trim();
const SEARCH_ENGINE_ID = "d47652e3aa4a74472".trim(); 

/**
 * Normalizes text for comparison - removes punctuation and extra whitespace
 */
const normalize = (text: string) => text.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();

/**
 * Heuristic similarity engine for overall score
 */
const calculateSimilarity = (input: string, target: string): number => {
  const cleanInput = normalize(input);
  const cleanTarget = normalize(target);
  
  const words1 = cleanInput.split(' ').filter(w => w.length > 2);
  const words2 = cleanTarget.split(' ').filter(w => w.length > 2);
  
  if (words1.length === 0 || words2.length === 0) return 0;

  const set1 = new Set(words1);
  const set2 = new Set(words2);
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  const jaccard = intersection.size / union.size;

  let sequenceMatch = 0;
  const phraseLength = 4;
  if (words1.length >= phraseLength) {
    let matches = 0;
    const sampleSize = Math.min(words1.length - phraseLength + 1, 15);
    for (let i = 0; i < sampleSize; i++) {
      const phrase = words1.slice(i, i + phraseLength).join(' ');
      if (cleanTarget.includes(phrase)) {
        matches++;
      }
    }
    sequenceMatch = matches / sampleSize;
  }

  const score = (jaccard * 0.3) + (sequenceMatch * 0.7);
  return Math.min(100, Math.round(score * 100 * 2.5));
};

/**
 * Breaks text into search-friendly chunks
 */
const getSearchQueries = (text: string): string[] => {
  const words = text.split(/\s+/).filter(w => w.length > 3);
  if (words.length === 0) return [];
  const queries: string[] = [];
  if (words.length >= 8) {
    queries.push(words.slice(0, 8).join(' '));
  } else {
    queries.push(words.join(' '));
  }
  if (words.length >= 30) {
    const mid = Math.floor(words.length / 2);
    queries.push(words.slice(mid, mid + 8).join(' '));
  }
  return queries;
};

/**
 * Generates highlighted HTML by comparing segments against sources.
 */
const generateHighlights = (text: string, sources: any[]): string => {
  if (!sources || sources.length === 0) return text;

  const tokens = text.split(/(\s+|[.!?,"';:()]+)/);
  const sourcePool = sources.map(s => normalize((s.snippet || "") + " " + (s.title || "") + " " + (s.content || "")));

  const wordInfo: { word: string; tokenIndex: number }[] = [];
  tokens.forEach((token, index) => {
    const clean = normalize(token);
    if (clean.length > 0) {
      wordInfo.push({ word: clean, tokenIndex: index });
    }
  });

  const matchedTokenIndices = new Set<number>();
  const windowSize = 3;

  for (let i = 0; i <= wordInfo.length - windowSize; i++) {
    const window = wordInfo.slice(i, i + windowSize);
    const phrase = window.map(w => w.word).join(' ');
    
    if (sourcePool.some(source => source.includes(phrase))) {
      const startIndex = window[0].tokenIndex;
      const endIndex = window[windowSize - 1].tokenIndex;
      for (let j = startIndex; j <= endIndex; j++) {
        matchedTokenIndices.add(j);
      }
    }
  }

  let html = "";
  let isCurrentlyHighlighted = false;

  tokens.forEach((token, index) => {
    const isMatch = matchedTokenIndices.has(index);

    if (isMatch && !isCurrentlyHighlighted) {
      html += `<mark class="bg-red-100 text-red-700 rounded-sm px-0.5 border-b-2 border-red-300 font-semibold transition-all duration-300">`;
      isCurrentlyHighlighted = true;
    } else if (!isMatch && isCurrentlyHighlighted) {
      html += `</mark>`;
      isCurrentlyHighlighted = false;
    }
    
    html += token;
  });

  if (isCurrentlyHighlighted) html += `</mark>`;

  return html;
};

export const checkPlagiarism = async (
  text: string, 
  vaultDocs: UserDocument[] = [], 
  includeWeb: boolean = true
): Promise<PlagiarismResult> => {
  if (!text || text.trim().length < 20) {
    return { score: 0, summary: "Input content is too short for a reliable scan.", sources: [] };
  }

  const WEB_SIMILARITY_THRESHOLD = 15;

  try {
    const vaultMatches = vaultDocs.map(doc => ({
      title: doc.title,
      // Encode ownerId and docId into the URL for easy retrieval in audit views
      url: `internal://vault/${doc.ownerId}/${doc.id}`,
      content: doc.content,
      isPrivate: true,
      score: calculateSimilarity(text, doc.content)
    })).filter(m => m.score > 5);

    const webSources: any[] = [];

    if (includeWeb && CUSTOM_SEARCH_KEY && SEARCH_ENGINE_ID) {
      const searchQueries = getSearchQueries(text);
      
      for (const q of searchQueries) {
        const params = new URLSearchParams({
          key: CUSTOM_SEARCH_KEY,
          cx: SEARCH_ENGINE_ID,
          q: q
        });

        try {
          const response = await fetch(`https://www.googleapis.com/customsearch/v1?${params.toString()}`);
          const data = await response.json();

          if (data.items) {
            data.items.forEach((item: any) => {
              const score = calculateSimilarity(text, (item.snippet || "") + " " + (item.title || ""));
              if (score >= WEB_SIMILARITY_THRESHOLD) {
                webSources.push({
                  title: item.title,
                  url: item.link,
                  snippet: item.snippet,
                  isPrivate: false,
                  score: score
                });
              }
            });
          }
        } catch (e) {
          console.warn("Search chunk failed, continuing...");
        }
      }
    }

    const allMatches = [...vaultMatches, ...webSources].sort((a, b) => b.score - a.score);
    const uniqueMatches = allMatches.filter((v, i, a) => a.findIndex(t => t.url === v.url) === i);
    const topScore = uniqueMatches.length > 0 ? Math.max(...uniqueMatches.map(m => m.score)) : 0;

    const highlightedHtml = generateHighlights(text, uniqueMatches);

    let summary = "";
    const scanContext = includeWeb ? "web and vault" : "private vault";

    if (uniqueMatches.length === 0) {
      summary = `No significant matches found in your ${scanContext}.`;
    } else if (topScore > 60) {
      summary = `High similarity detected (${topScore}%). Content appears in ${uniqueMatches.length} external sources.`;
    } else {
      summary = `Audit complete: ${topScore}% overlap detected across ${uniqueMatches.length} sources.`;
    }

    return {
      score: Math.min(100, topScore),
      summary,
      highlightedHtml,
      sources: uniqueMatches.map(({title, url, score, isPrivate}) => ({title, url, score, isPrivate}))
    };
  } catch (error: any) {
    console.error("Plagiarism Service Error:", error);
    throw error;
  }
};

export const compareTexts = async (textA: string, textB: string): Promise<ComparisonResult> => {
  const score = calculateSimilarity(textA, textB);
  const cleanB = normalize(textB).split(' ').filter(w => w.length > 1);
  const cleanA = normalize(textA).split(' ').filter(w => w.length > 1);
  const setA = new Set(cleanA);
  const setB = new Set(cleanB);
  
  const highlightOverlap = (content: string, compareWords: Set<string>) => {
    return content.split(/(\s+)/).map(part => {
      const clean = part.toLowerCase().replace(/[^\w]/g, '');
      if (clean && compareWords.has(clean)) {
        return `<mark class="bg-amber-100 text-amber-900 rounded-sm px-0.5">${part}</mark>`;
      }
      return part;
    }).join('');
  };

  return {
    score,
    summary: score > 50 
      ? "High structural overlap detected between both documents." 
      : "Low direct overlap, but some matching keywords identified.",
    highlightedTextA: highlightOverlap(textA, setB),
    highlightedTextB: highlightOverlap(textB, setA)
  };
};
