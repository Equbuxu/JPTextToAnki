import { Card } from "../card";
import { KanjiCardModel } from "../models/kanji-card-model";
import { ViewsCommon } from "./views-common";

export function GetCard(model: KanjiCardModel): Card {
    return new Card(createFront(model), createBack(model));
}

function createFront(model: KanjiCardModel): string {
    return `<span class="card-front">${model.kanji.kanji}</span>`;
}

function createBack(model: KanjiCardModel): string {
    return '' +
    `<div>
        <b>${model.sourceWord}</b>
        <span class="inline-weak"><a href="${encodeURI('https://jisho.org/search/' + model.sourceWordOriginalSearch)}">${model.sourceWordOriginalSearch}</a></span>
    </div>
    <div>
        <b>${model.sourceWordReading}</b>
    </div>
    ${ViewsCommon.createKanjiView(model.kanji)}
    <div class="japanki-kanji-card-readings">Words w/ this kanji:</div> 
    <div>
        ${model.allWordsWithThisKanji.join(", ")}
    </div>
    `;
}