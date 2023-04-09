import { NoteModel } from "./note-model";

export class Note {
    constructor(fields: Array<NoteField>, audio: NoteAudio[], model: NoteModel) {
        if (model == null) {
            throw new Error('Model is undefined');
        }
        this.fields = fields;
        this.audio = audio;
        this.noteModel = model;
    }

    fields: Array<NoteField>;
    audio: NoteAudio[];
    noteModel: NoteModel;
}

export class NoteField {
    constructor(name: string, text: string) {
        this.name = name;
        this.text = text;
    }
    name: string; 
    text: string;
}

export class NoteAudio {
    constructor(audioPath : string, audioFilename : string) {
        this.audioPath = audioPath;
        this.audioFilename = audioFilename;
    }
    audioPath : string;
    audioFilename : string;
}