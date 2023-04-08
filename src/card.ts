export class Card {
    constructor(frontHtml: string, backHtml: string, frontFieldName : string, backFieldName : string, audio: CardAudio[]) {
        this.frontHtml = frontHtml;
        this.backHtml = backHtml;
        this.frontFieldName = frontFieldName;
        this.backFieldName = backFieldName;
        this.audio = audio;
    }

    frontHtml: string;
    backHtml: string;
    frontFieldName: string;
    backFieldName: string;
    audio: CardAudio[];
}

export class CardAudio {
    constructor(audioPath : string, audioFilename : string) {
        this.audioPath = audioPath;
        this.audioFilename = audioFilename;
    }
    audioPath : string;
    audioFilename : string;
}