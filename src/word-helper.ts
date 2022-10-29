export const kanjiRegex = /[一-龯]/g;

export function splitToKanji(word: string): string[] {
    return [...word.matchAll(kanjiRegex)].map(a => a[0]);
}

export function removeDuplicateStrings(array: string[]) : string[] {
    return [...new Set(array)];
}