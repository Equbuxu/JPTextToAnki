export class Card {
    constructor(frontHtml: string, backHtml: string) {
        this.frontHtml = frontHtml;
        this.backHtml = backHtml;
    }

    frontHtml: string;
    backHtml: string;
}