import { WordCardModel } from "./word-card-model";
import * as CachedJisho from "../cached-jisho";

import { WordHelper } from "../word-helper";
import { KanjiModel, ModelsCommon } from "./models-common";
import { getFromConfig } from "../config";

export class KanjiWordData {
    constructor(kanjiWord: string, kanaWord: string, searchedWord: string) {
        this.kanjiWord = kanjiWord;
        this.kanaWord = kanaWord;
        this.searchedWord = searchedWord;
    }
    kanjiWord: string; 
    kanaWord: string;
    searchedWord: string;
}

export class KanjiCardModel {
    constructor(kanji: KanjiModel, allWordsWithThisKanji: KanjiWordData[]) {
        this.kanji = kanji;
        this.allWordsWithThisKanji = allWordsWithThisKanji;
    }
    kanji: KanjiModel;
    allWordsWithThisKanji: KanjiWordData[];
}

export async function CreateKanjiCardsForWords(wordCards: WordCardModel[]): Promise<KanjiCardModel[]> {
    return (
        await Promise.all(
            collectKanjiFromWordCards(wordCards)
            .map(kanji => CreateKanjiCardForKanji(kanji, wordCards)))
            )
            .filter(card => card != null) as KanjiCardModel[];
}

async function CreateKanjiCardForKanji(kanji: string, wordCards: WordCardModel[]): Promise<KanjiCardModel | null> {
    const kanjiModel = await ModelsCommon.GetKanjiModel(kanji);
    if (kanjiModel == null) {
        return null;
    }
    const words = findWordsWithKanji(kanji, wordCards);
    return new KanjiCardModel(kanjiModel, words);
}

function collectKanjiFromWordCards(words: WordCardModel[]): string[] {
    const useKanjiFromJisho = getFromConfig('use-kanji-from-jisho') as boolean;

    return [...new Set(words.flatMap(word => WordHelper.splitToKanji(useKanjiFromJisho ? word.mainFormWithKanji : word.originalSearchText)))];
}


function findWordsWithKanji(kanji: string, wordCards: WordCardModel[]): KanjiWordData[] {
    return wordCards.filter(card => card.mainFormWithKanji.includes(kanji)).map(card => new KanjiWordData(card.mainFormWithKanji, card.mainFormReading, card.originalSearchText));
}