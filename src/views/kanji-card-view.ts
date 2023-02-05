import { Card } from "../card";
import { KanjiCardModel } from "../models/kanji-card-model";
import { ViewsCommon } from "./views-common";

export function GetCard(model: KanjiCardModel): Card {
    return new Card(createFront(model), createBack(model));
}

function createFront(model: KanjiCardModel): string {
    return `${model.kanji.kanji}`;
}

function createBack(model: KanjiCardModel): string {
    return '' +
    `
    ${model.allWordsWithThisKanji.map(word => `
    <div>
        <b>${word.kanjiWord};</b>
        <b>${word.kanaWord};</b>
        <span class="inline-weak"><a href="${encodeURI('https://jisho.org/search/' + word.searchedWord)}">${word.searchedWord}</a></span>
    </div>
    `).join('')}
    
    ${ViewsCommon.createKanjiView(model.kanji)}
    `;
}