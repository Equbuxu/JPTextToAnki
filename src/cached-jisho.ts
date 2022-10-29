import JishoAPI, { JishoAPIResult, KanjiParseResult } from 'unofficial-jisho-api';
import { LightKanjiParseResult, LightJishoResult, LightJishoApiResult } from './cached-jisho-types';
import * as fs from 'fs';
const jisho = new JishoAPI();
const cachePath = './files/jishoCache.json';

let cache : { searchForKanji:Map<string, LightKanjiParseResult>, searchForPhrase:Map<string, LightJishoResult[]> };
loadCache();


function loadCache() {
    cache = {searchForKanji: new Map<string, LightKanjiParseResult>(), searchForPhrase: new Map<string, LightJishoResult[]>()}
    if (fs.existsSync(cachePath)) {
        let cacheJson = fs.readFileSync(cachePath).toString('utf-8');
        let rawCache = JSON.parse(cacheJson);
        for (let key in rawCache.searchForKanji) {
            cache.searchForKanji.set(key, rawCache.searchForKanji[key]);
        }
        for (let key in rawCache.searchForPhrase) {
            cache.searchForPhrase.set(key, rawCache.searchForPhrase[key]);
        }
    }
}

export function saveCache() {
    let converted = { 
        searchForKanji: Object.fromEntries(cache.searchForKanji), 
        searchForPhrase: Object.fromEntries(cache.searchForPhrase)
    };
    fs.writeFileSync(cachePath, JSON.stringify(converted));
}

export async function searchForKanji(kanji: string) : Promise<LightKanjiParseResult> {
    let cached = cache.searchForKanji.get(kanji);
    if (cached !== undefined) {
        return cached;
    }

    let result : KanjiParseResult | null = null;
    do {
        try {
            await waitBeforeCallingApi();
            result = await jisho.searchForKanji(kanji);
        } catch (error) {
            await new Promise(r => setTimeout(r, 2000));
        }
    } while (result === null);

    let lightKanjiParseResult = new LightKanjiParseResult(result);
    cache.searchForKanji.set(kanji, lightKanjiParseResult);

    return lightKanjiParseResult;
}

export async function searchForPhrase(phrase: string) : Promise<LightJishoApiResult> {
    let cached = cache.searchForPhrase.get(phrase);
    if (cached !== undefined) {
        return cached;
    }

    let result : JishoAPIResult | null = null;
    do {
        try {
            await waitBeforeCallingApi();
            result = await jisho.searchForPhrase('"' + phrase + '"');
        } catch (error) {
            await new Promise(r => setTimeout(r, 2000));
        }
    } while (result === null);

    let lightJishoResults = result.data.map(a => new LightJishoResult(a));
    cache.searchForPhrase.set(phrase, lightJishoResults);

    return lightJishoResults;
}

const delayMsBetweenApiCalls = 1000;
let lastApiCallTimeMs = Date.now();
async function waitBeforeCallingApi() {
    const curMs = Date.now();
    const msSinceLastCall = curMs - lastApiCallTimeMs;
    if (msSinceLastCall < delayMsBetweenApiCalls) {
        const leftToWait = delayMsBetweenApiCalls - msSinceLastCall;
        lastApiCallTimeMs = curMs + leftToWait;
        await new Promise(r => setTimeout(r, leftToWait));
    }
}