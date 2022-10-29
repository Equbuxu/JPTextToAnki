import { JishoResult, JishoJapaneseWord, JishoWordSense, Radical, KanjiParseResult } from "unofficial-jisho-api";

export type LightJishoApiResult = LightJishoResult[];

export class LightJishoResult {
    constructor(apiResult: JishoResult) {
        this.slug = apiResult.slug;
        this.is_common = apiResult.is_common;
        this.tags = apiResult.tags;
        this.jlpt = apiResult.jlpt;
        this.japanese = apiResult.japanese;
        this.senses = apiResult.senses.map(a => new LightJishoWordSense(a));
    }
    slug: string;
    is_common: boolean;
    tags: string[];
    jlpt: string[];
    japanese: JishoJapaneseWord[];
    senses: LightJishoWordSense[];
}

export class LightJishoWordSense {
    constructor(apiResult: JishoWordSense) {
        this.english_definitions = apiResult.english_definitions;
        this.parts_of_speech = apiResult.parts_of_speech;
        this.info = apiResult.info;
        this.tags = apiResult.tags;
    }
    english_definitions: string[];
    parts_of_speech: string[];
    info: string[];
    tags: string[];
}

export class LightKanjiParseResult {
    constructor(apiResult: KanjiParseResult) {
        this.taughtIn = apiResult.taughtIn;
        this.jlptLevel = apiResult.jlptLevel;
        this.newspaperFrequencyRank = apiResult.newspaperFrequencyRank;
        this.meaning = apiResult.meaning;
        this.kunyomi = apiResult.kunyomi;
        this.onyomi = apiResult.onyomi;
        this.radical = apiResult.radical;
        this.parts = apiResult.parts;
        this.query = apiResult.query;
        this.found = apiResult.found;
    }
    taughtIn: string;
    jlptLevel: string;
    newspaperFrequencyRank: string;
    meaning: string;
    kunyomi: string[];
    onyomi: string[];
    radical: Radical; 
    parts: string[]; 
    query: string;
    found: boolean;
}