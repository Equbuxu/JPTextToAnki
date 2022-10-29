import { Card } from "../card";
import { KanjiModel, SenseModel, WordCardModel } from "../models/word-card-model";

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

    ${model.kanji.map(kanji => createKanjiView(kanji)).join("")}
    `;
}

function createKanjiView(model: KanjiModel): string {
    return '' + 
    `<div>
        <div>
            <a href="${encodeURI('https://kanji.koohii.com/study/kanji/' + model.kanji)}">${model.kanji}</a>
            ${model.jlpt == null ? '' : `(${model.jlpt})`}: ${model.meaning}
        </div>

        ${model.kun.length == 0 ? '' : 
        `<div>
            Kun: ${model.kun.join(', ')}
        </div>`}

        ${model.on.length == 0 ? '' : 
        `<div>
            On: ${model.on.join(', ')}
        </div>`}
    </div>
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
    return `<span class="card-front">${model.mainFormWithKanji}</span>`;
}