import { Card } from "./card";

export function encodeCardsAsCsv(cards: Card[]): string {
    return cards.map(card => `"${prepareStringForField(card.frontHtml)}"\t"${prepareStringForField(card.backHtml)}"`).join('\n');
}

function prepareStringForField(str: string): string {
    return str.replace(/[\n\r\t]/g, '').replace(/\"/g, '""');
}