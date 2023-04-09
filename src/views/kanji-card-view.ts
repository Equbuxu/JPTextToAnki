import { Note, NoteField } from "../card";
import { Config } from "../config";
import { KanjiCardModel } from "../models/kanji-card-model";
import { ViewsCommon } from "./views-common";

export function GetKanjiNoteModelName() {
    return 'JPTextToAnki-Kanji';
}

export function GetNote(model: KanjiCardModel): Note {
    return new Note([
        new NoteField('Kanji', createKanji(model)),
        new NoteField('WordsWithKanji', createWordsWithKanji(model)),
        new NoteField('KanjiInfo', createKanjiInfo(model)),
    ], [], Config.getNoteModels().filter(a => a.name === GetKanjiNoteModelName())[0]);
}

function createKanji(model: KanjiCardModel): string {
    return `${model.kanji.kanji}`;
}

function createWordsWithKanji(model: KanjiCardModel): string {
    return '' +
    `${model.allWordsWithThisKanji.map(word => `
    <div>
        <b>${word.kanjiWord};</b>
        <b>${word.kanaWord};</b>
        <span class="inline-weak"><a href="${encodeURI('https://jisho.org/search/' + word.searchedWord)}">${word.searchedWord}</a></span>
    </div>
    `).join('')}
    `;
}

function createKanjiInfo(model: KanjiCardModel): string {
    return ViewsCommon.createKanjiView(model.kanji);
}