import { WordCardModel } from "./word-card-model";

import { WordHelper } from "../word-helper";
import { KanjiModel, ModelsCommon } from "./models-common";
import { Config, getFromConfig } from "../config";
import { AnkiApi, NotesInfoCallResult } from "../anki-api";
import { GetWordNoteModelName } from "../views/word-card-view";

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
    /*return (
        await Promise.all(
            collectKanjiFromWordCards(wordCards)
            .map(kanji => CreateKanjiCardForKanji(kanji, wordCards)))
            )
            .filter(card => card != null) as KanjiCardModel[];*/
    const models = [];
    for (const kanji of collectKanjiFromWordCards(wordCards)) {
        const result = await CreateKanjiCardForKanji(kanji, wordCards);
        if (result == null) {
            continue;
        }
        models.push(result);
    }
    return models;
}

async function CreateKanjiCardForKanji(kanji: string, wordCards: WordCardModel[]): Promise<KanjiCardModel | null> {
    const kanjiModel = await ModelsCommon.GetKanjiModel(kanji);
    if (kanjiModel == null) {
        return null;
    }

    const limit: number = Config.getFromConfig('kanji-word-count-limit');
    let words = findWordsWithKanji(kanji, wordCards);
    words.push(...await findNotesWithKanji(kanji));
    words = [...new Map(words.map(word => [word.kanjiWord, word])).values()];
    if (words.length > limit) {
        words = words.slice(0, limit);
    }

    return new KanjiCardModel(kanjiModel, words);
}

function collectKanjiFromWordCards(words: WordCardModel[]): string[] {
    const useKanjiFromJisho = Config.getFromConfig('use-kanji-from-jisho') as boolean;

    return [...new Set(words.flatMap(word => WordHelper.splitToKanji(useKanjiFromJisho ? word.mainFormWithKanji : word.originalSearchText)))];
}

function findWordsWithKanji(kanji: string, wordCards: WordCardModel[]): KanjiWordData[] {
    return wordCards.filter(card => card.mainFormWithKanji.includes(kanji)).map(card => new KanjiWordData(card.mainFormWithKanji, card.mainFormReading, card.originalSearchText));
}

async function findNotesWithKanji(kanji: string): Promise<KanjiWordData[]> {
    const existingNotes = await AnkiApi.getCachedNotesByNoteModel(GetWordNoteModelName());
    if (existingNotes instanceof Error) {
        console.log(`Error while trying to retrive existing notes, not using them...`);
        return [];
    }

    return existingNotes.filter(note => note.fields['Word'].value.includes(kanji)).map(note => new KanjiWordData(note.fields['Word'].value, note.fields['WordReading'].value, note.fields['WordAsAppearsInText'].value));
}