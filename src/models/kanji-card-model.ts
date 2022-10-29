import { WordCardModel } from "./word-card-model";
import * as CachedJisho from "../cached-jisho";

import Kuroshiro from "kuroshiro";
import KuromojiAnalyzer from "kuroshiro-analyzer-kuromoji";
import levenshtein from 'js-levenshtein';
import { splitToKanji } from "../word-helper";

let kuroshiro : Kuroshiro;
export async function init() {
    kuroshiro = new Kuroshiro();
    await kuroshiro.init(new KuromojiAnalyzer());
}

export class KanjiCardModel {
    constructor(kanji: string, kun: string[], on: string[], sourceWord: string, sourceWordReading: string, allWordsWithThisKanji: string[]) {
        this.kanji = kanji;
        this.kun = kun;
        this.on = on;
        this.sourceWord = sourceWord;
        this.sourceWordReading = sourceWordReading;
        this.allWordsWithThisKanji = allWordsWithThisKanji;
    }
    kanji: string;
    kun: string[];
    on: string[];
    sourceWord: string;
    sourceWordReading: string;
    allWordsWithThisKanji: string[];
}

export async function CreateKanjiCardsForWord(wordCards: WordCardModel[], word: WordCardModel): Promise<KanjiCardModel[]> {
    const readings = splitToKanji(word.mainFormWithKanji);
    const cards = await Promise.all(readings.map(kanji => CreateKanjiCardForKanji(kanji, word, wordCards)));
    return cards.filter(card => card != null) as KanjiCardModel[];
}

async function CreateKanjiCardForKanji(kanji: string, sourceWord: WordCardModel, wordCards: WordCardModel[]): Promise<KanjiCardModel | null> {
    const jishoData = await CachedJisho.searchForKanji(kanji);
    if (!jishoData.found) {
        return null;
    }
    const words = findWordsWithKanji(kanji, wordCards);
    return new KanjiCardModel(kanji, jishoData.kunyomi, jishoData.onyomi, sourceWord.mainFormWithKanji, sourceWord.mainFormReading, words);
}

function findWordsWithKanji(kanji: string, wordCards: WordCardModel[]): string[] {
    return wordCards.filter(card => card.mainFormWithKanji.includes(kanji)).map(card => card.mainFormWithKanji);
}