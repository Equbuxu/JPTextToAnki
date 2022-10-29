import { Card } from "../card";
import { KanjiCardModel } from "../models/kanji-card-model";

export function GetCard(model: KanjiCardModel): Card {
    return new Card(createFront(model), createBack(model));
}

function createFront(model: KanjiCardModel): string {
    return `<div class="japanki-kanji-card-kanji">${model.kanji}</div>`;
}

function createBack(model: KanjiCardModel): string {
    return '' + 
`<div class="japanki-kanji-card-sourceWord">${model.sourceWord}</div>
<div class="japanki-kanji-card-sourceWordReading">${model.sourceWordReading}</div>
<div class="japanki-kanji-card-readings">Kun: ${model.kun}</div>
<div class="japanki-kanji-card-readings">On: ${model.on}</div>
<div class="japanki-kanji-card-readings">Words: ${model.allWordsWithThisKanji.join(", ")}</div>
`
}