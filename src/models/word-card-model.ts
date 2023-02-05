import * as CachedJisho from '../cached-jisho';
import { WordHelper } from '../word-helper'
import { KanjiModel, ModelsCommon } from './models-common';

export class WordCardModel {
    constructor(mainFormWithKanji: string, mainFormReading: string, originalSearchText: string, senses: SenseModel[], kanji: KanjiModel[]) {
        this.mainFormWithKanji = mainFormWithKanji;
        this.mainFormReading = mainFormReading;
        this.senses = senses;
        this.kanji = kanji;
        this.originalSearchText = originalSearchText;
    }
    mainFormWithKanji: string;
    mainFormReading: string;

    senses: SenseModel[];
    kanji: KanjiModel[];

    originalSearchText: string;
}

export class SenseModel {
    constructor(partsOfSpeech: string[], englishDefinitions: string[], notes: string[]) {
        this.partsOfSpeech = partsOfSpeech;
        this.englishDefinitions = englishDefinitions;
        this.notes = notes;
    }
    partsOfSpeech: string[];
    englishDefinitions: string[];
    notes: string[];
}

export async function CreateModelForWord(rawWord: string): Promise<WordCardModel | null> {
    const foundWords = await CachedJisho.searchForPhrase(rawWord);
    if (foundWords === undefined || foundWords.length == 0) {
        return null;
    }
    const word = foundWords[0];

    const mainFormWithKanji = word.japanese[0]?.word;
    const mainFormReading = word.japanese[0]?.reading ?? mainFormWithKanji;
    if (mainFormWithKanji === undefined || mainFormReading === undefined || mainFormWithKanji === null || mainFormReading === null) {
        return null;
    }

    const kanjiStrings: string[] = WordHelper.removeDuplicateStrings(WordHelper.splitToKanji(mainFormWithKanji));

    const senses: SenseModel[] = word.senses.map(sense => {
        const notes : string[] = [...sense.info];
        const kanaAloneText = "Usually written using kana alone";
        if (sense.tags.includes(kanaAloneText)) {
            notes.push(kanaAloneText)
        }
        return new SenseModel(sense.parts_of_speech, sense.english_definitions, notes)
    });

    const kanji: KanjiModel[] = (await Promise.all(kanjiStrings.map(ModelsCommon.GetKanjiModel))).filter(a => a != null) as KanjiModel[];

    return new WordCardModel(mainFormWithKanji, mainFormReading, rawWord, senses, kanji);
}