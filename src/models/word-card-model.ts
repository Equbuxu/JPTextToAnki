import { AudioFileData, AudioFilesCatalog } from '../audio-files-catalog';
import * as CachedJisho from '../cached-jisho';
import { NoteAudio } from '../card';
import { Config } from '../config';
import { WordHelper } from '../word-helper'
import { KanjiModel, ModelsCommon } from './models-common';
import * as crypto from 'crypto';
import * as path from 'path';
import fs from 'fs';

export class WordCardModel {
    constructor(mainFormWithKanji: string, mainFormReading: string, originalSearchText: string, senses: SenseModel[], kanji: KanjiModel[], audio: AudioSentenseModel[]) {
        this.mainFormWithKanji = mainFormWithKanji;
        this.mainFormReading = mainFormReading;
        this.senses = senses;
        this.kanji = kanji;
        this.originalSearchText = originalSearchText;
        this.audio = audio;
    }
    mainFormWithKanji: string;
    mainFormReading: string;

    senses: SenseModel[];
    kanji: KanjiModel[];
    audio: AudioSentenseModel[];

    originalSearchText: string;
}

export class AudioSentenseModel
{
    constructor(audioPath : string, audioFilename : string, sentenseJp: string, sentenseEng: string) {
        this.audioPath = audioPath;
        this.audioFilename = audioFilename;
        this.sentenceEng = sentenseEng;
        this.sentenceJp = sentenseJp;
    }
    audioPath : string;
    audioFilename : string;
    sentenceJp: string; 
    sentenceEng: string;
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

    const mainFormWithKanji = word.japanese[0]?.word ?? word.japanese[0]?.reading;
    const mainFormReading = word.japanese[0]?.reading ?? mainFormWithKanji;
    if (mainFormWithKanji === undefined || mainFormReading === undefined || mainFormWithKanji === null || mainFormReading === null) {
        return null;
    }

    const kanjiStrings: string[] = WordHelper.removeDuplicateStrings(WordHelper.splitToKanji(mainFormWithKanji));

    const senses: SenseModel[] = word.senses.map(sense => {
        const notes : string[] = [...sense.info];
        const kanaAloneText = 'Usually written using kana alone';
        if (sense.tags.includes(kanaAloneText)) {
            notes.push(kanaAloneText)
        }
        return new SenseModel(sense.parts_of_speech, sense.english_definitions, notes)
    });

    const kanji: KanjiModel[] = (await Promise.all(kanjiStrings.map(ModelsCommon.GetKanjiModel))).filter(a => a != null) as KanjiModel[];

    let audio: Array<AudioSentenseModel> = [];
    if (Config.getFromConfig('include-audio')) {
        audio = AudioFilesCatalog.search(mainFormWithKanji, 3)
            .map(a => new AudioSentenseModel(getFullAudioPath(a), getUniqueFilename(a.audio_jap), a.jap, a.eng))
            .filter(a => fs.existsSync(a.audioPath));
        const limit: number = Config.getFromConfig('audio-count-limit');
        if (audio.length > limit) {
            audio = audio.slice(0, limit);
        }
    }

    return new WordCardModel(mainFormWithKanji, mainFormReading, rawWord, senses, kanji, audio);
}

function getUniqueFilename(pathStr: string): string {
    const hash = crypto.createHash('md5').update(pathStr).digest('hex');
    const ext = path.extname(pathStr);
    return `${hash}${ext}`;
}

function getFullAudioPath(data: AudioFileData): string {
    return process.cwd() + '\\audio_files\\' + data.audio_jap.replace('/', '\\');
}