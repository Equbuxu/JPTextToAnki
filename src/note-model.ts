export class NoteModel {
    constructor(name: string, css: string, templates: CardTemplate[], fieldNames: string[]) {
        this.name = name;
        this.css = css;
        this.templates = templates;
        this.fieldNames = fieldNames;
    }
    name: string;
    css: string;
    fieldNames: string[];
    templates: CardTemplate[];
}

export class CardTemplate {
    constructor(name: string, frontTemplate: string, backTemplate: string) {
        this.name = name;
        this.frontTemplate = frontTemplate;
        this.backTemplate = backTemplate;
    }
    name: string;
    frontTemplate: string;
    backTemplate: string;
}