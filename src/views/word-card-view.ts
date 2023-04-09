import { Note, NoteAudio, NoteField } from "../card";
import { SenseModel, WordCardModel } from "../models/word-card-model";
import { ViewsCommon } from "./views-common";
import { Config } from "../config";

export function GetWordNoteModelName() {
    return 'JPTextToAnki-Word';
}

export function GetNote(model: WordCardModel): Note {
    return new Note([
        new NoteField('Word', createWordField(model)),
        new NoteField('WordReading', createWordReadingField(model)),
        new NoteField('WordAsAppearsInText', createWordAsAppearsInTextField(model)),
        new NoteField('Senses', createSensesField(model)),
        new NoteField('Audio', createAudioField(model)),
        new NoteField('KanjiInfo', createKanjiInfoField(model)),
    ], model.audio.map(a => new NoteAudio(a.audioPath, a.audioFilename)), Config.getNoteModels().filter(a => a.name === GetWordNoteModelName())[0]);
}

function createWordField(model: WordCardModel): string {
    return model.mainFormWithKanji;
}

function createWordReadingField(model: WordCardModel): string {
    return model.mainFormReading;
}
function createWordAsAppearsInTextField(model: WordCardModel): string {
    return model.originalSearchText;
}
function createSensesField(model: WordCardModel): string {
    return '' +
    `<div class="title">
        <a href="${encodeURI('https://jisho.org/search/' + model.originalSearchText)}">Translations:</a>
    </div>

    ${model.senses.map(sense => createSenseView(sense)).join("")}`;
}
function createAudioField(model: WordCardModel): string {
    return '' +
    `${model.audio.length == 0 ? '' : 
    `<div class="title">
        Audio:
    </div>`}

    ${model.audio.map(audio => 
    `<div>
        <div class="weak">${audio.sentenceEng}</div>
        ${audio.sentenceJp}[sound:${audio.audioFilename}]
    </div>`
    ).join("")}`;
}
function createKanjiInfoField(model: WordCardModel): string {
    return '' +
    `${model.kanji.length == 0 ? '' : 
    `<div class="title">
        Kanji:
    </div>`}

    ${model.kanji.map(kanji => ViewsCommon.createKanjiView(kanji)).join("")}`;
}

function createSenseView(model: SenseModel): string {
    const lightGrayNotes: string = [...model.partsOfSpeech, ...model.notes].join("</br>");
    const englishDefs: string = model.englishDefinitions.join(", ");

    return '' +
    `<div class="weak">
        ${lightGrayNotes}
    </div>
    <div>
        ${englishDefs}
    </div>
    `;
}