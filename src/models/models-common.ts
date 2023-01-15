import * as CachedJisho from '../cached-jisho';

export class KanjiModel {
    constructor(kanji: string, kun: string[], on: string[], meaning: string, jlpt: null | string) {
        this.kanji = kanji;
        this.kun = kun;
        this.on = on;
        this.jlpt = jlpt;
        this.meaning = meaning;
    }
    meaning: string;
    kanji: string;
    kun: string[];
    on: string[];
    jlpt: null | string;
}

export module ModelsCommon {
    export async function GetKanjiModel(kanjiString: string): Promise<KanjiModel | null> {
        const fetchedKanji = await CachedJisho.searchForKanji(kanjiString);
        if (fetchedKanji == null) {
            return null;
        }

        return new KanjiModel(kanjiString, fetchedKanji.kunyomi, fetchedKanji.onyomi, fetchedKanji.meaning, fetchedKanji.jlptLevel);
    }
}