import { Card } from "../card";
import { SenseModel, WordCardModel } from "../models/word-card-model";
import { KanjiModel } from "../models/models-common";
import { ViewsCommon } from "./views-common";

export function GetCard(model: WordCardModel): Card {
    return new Card(createFront(model), createBack(model));
}

function createBack(model: WordCardModel): string {
    return '' +
    `<div>
        <b>${model.mainFormReading}</b>
        <span class="inline-weak">${model.originalSearchText}</span>
    </div>
    
    <div class="title">
        <a href="${encodeURI('https://jisho.org/search/' + model.originalSearchText)}">Translations:</a>
    </div>

    ${model.senses.map(sense => createSenseView(sense)).join("")}

    ${model.kanji.length == 0 ? '' : 
    `<div class="title">
        Kanji:
    </div>`}

    ${model.kanji.map(kanji => ViewsCommon.createKanjiView(kanji)).join("")}
    `;
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

function createFront(model: WordCardModel): string {
    return `${model.mainFormWithKanji}`;
}