import { WordCardModel } from "./word-card-model";
import * as CachedJisho from "../cached-jisho";

import { splitToKanji } from "../word-helper";
import { KanjiModel, ModelsCommon } from "./models-common";

export class KanjiCardModel {
    constructor(kanji: KanjiModel, sourceWord: string, sourceWordReading: string, sourceWordOriginalSearch: string, allWordsWithThisKanji: string[]) {
        this.kanji = kanji;
        this.sourceWord = sourceWord;
        this.sourceWordReading = sourceWordReading;
        this.sourceWordOriginalSearch = sourceWordOriginalSearch;
        this.allWordsWithThisKanji = allWordsWithThisKanji;
    }
    kanji: KanjiModel;
    sourceWord: string;
    sourceWordReading: string;
    sourceWordOriginalSearch: string;
    allWordsWithThisKanji: string[];
}

export async function CreateKanjiCardsForWord(wordCards: WordCardModel[], word: WordCardModel): Promise<KanjiCardModel[]> {
    const readings = splitToKanji(word.mainFormWithKanji);
    const cards = await Promise.all(readings.map(kanji => CreateKanjiCardForKanji(kanji, word, wordCards)));
    return cards.filter(card => card != null) as KanjiCardModel[];
}

async function CreateKanjiCardForKanji(kanji: string, sourceWord: WordCardModel, wordCards: WordCardModel[]): Promise<KanjiCardModel | null> {
    const kanjiModel = await ModelsCommon.GetKanjiModel(kanji);
    if (kanjiModel == null) {
        return null;
    }
    const words = findWordsWithKanji(kanji, wordCards);
    return new KanjiCardModel(kanjiModel, sourceWord.mainFormWithKanji, sourceWord.mainFormReading, sourceWord.originalSearchText, words);
}

function findWordsWithKanji(kanji: string, wordCards: WordCardModel[]): string[] {
    return wordCards.filter(card => card.mainFormWithKanji.includes(kanji)).map(card => card.mainFormWithKanji);
}