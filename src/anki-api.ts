import axios from 'axios';
import { Note, NoteAudio } from './card';
import { Config, getFromConfig } from './config';
import { NoteModel } from './note-model';

let notesCache: {[noteType: string]: NotesInfoCallResult[]} = {};

export interface NotesInfoCallResult {
    noteId: number;
    modelName: string;
    tags: string[];
    fields: {[name: string]: {value: string, order: number}};
}

export module AnkiApi {
    export async function sendNotesToAnki(notes : Note[], deckName : string, modelName : string) : Promise<null | Array<Error>> {
        const existingDecks = await deckNames();
        if (existingDecks instanceof Error) return [existingDecks];

        if (!existingDecks.includes(deckName)) {
            const creationResult = await createDeck(deckName);
            if (creationResult instanceof Error) return [creationResult];
        }

        const errors : Array<Error> = [];
        for (const note of notes) {
            const existingNote = await findNotes(`"${note.fields[0].name}:${note.fields[0].text}" "note:${note.noteModel.name}"`);
            let existingNoteId : number | null = null;
            if (existingNote instanceof Error) {
                errors.push(existingNote);
            } else if (existingNote.length > 0) {
                existingNoteId = existingNote[0];
            }

            if (existingNoteId != null && !Config.getFromConfig('update-duplicate-notes')) {
                continue;
            }

            const fields: { [name: string]: string } = {};
            for (const field of note.fields) {
                if (!note.noteModel.fieldNames.includes(field.name)) {
                    continue;
                }
                fields[field.name] = field.text;
            }

            for (const audio of note.audio) {
                const storeMediaResult = await storeMediaFile(audio.audioFilename, audio.audioPath);
                if (storeMediaResult instanceof Error) {
                    errors.push(storeMediaResult);
                }
            }

            const addResult = existingNoteId == null ? await addNote(deckName, modelName, fields) : await updateNoteFields(existingNoteId, fields);
            if (addResult instanceof Error) {
                errors.push(addResult);
            }
        }
        if (errors.length > 0)
            return errors;
        return null;
    }

    export async function getCachedNotesByNoteModel(noteModelName : string) : Promise<Error | NotesInfoCallResult[]> {
        if (notesCache[noteModelName] != null) {
            return notesCache[noteModelName];
        }
        const notesIds = await findNotes(`note:${noteModelName}`);
        if (notesIds instanceof Error) { return notesIds; }

        const notes = await notesInfo(notesIds);
        if (notes instanceof Error) { return notes; }

        notesCache[noteModelName] = notes;
        return notes;
    }

    export async function deckNames() : Promise<Error | Array<string>> {
        return ankiPost({
            action: 'deckNames',
            version: 6
        });
    }

    export async function createDeck(newDeckName : string) : Promise<Error | number> {
        return ankiPost({
            action: 'createDeck',
            version: 6,
            params: {
                deck: newDeckName
            }
        });
    }

    export async function findNotes(query: string): Promise<Error | number[]> {
        return ankiPost({
            action: 'findNotes',
            version: 6,
            params: {
                query: query
            }
        });
    }

    export async function notesInfo(notes: number[]): Promise<Error | NotesInfoCallResult[]> {
        return ankiPost({
            action: 'notesInfo',
            version: 6,
            params: {
                notes: notes
            }
        });
    }

    export async function addNote(deckName : string, modelName : string, fields : any) {
        return ankiPost({
            action: 'addNote',
            version: 6,
            params: {
                note: {
                    deckName: deckName,
                    modelName: modelName,
                    fields: fields
                }
            }
        });
    }

    export async function updateNoteFields(id: number, fields : any) {
        return ankiPost({
            action: 'updateNoteFields',
            version: 6,
            params: {
                note: {
                    id: id,
                    fields: fields
                }
            }
        });
    }

    export async function storeMediaFile(filename: string, path: string) {
        return ankiPost({
            action: 'storeMediaFile',
            version: 6,
            params: {
                filename: filename,
                path: path
            }
        });
    }

    export async function uploadNoteModels() : Promise<Error | null> {
        const modelNames = await getModelNames();
        if (modelNames instanceof Error) return modelNames;
        
        const noteTypes = Config.getNoteModels();
        for (const model of noteTypes) {
            if (!modelNames.includes(model.name)) {
                const res = await createModel(model);
                if (res instanceof Error) return res;
            }
        }

        return null;
    }

    async function createModel(model: NoteModel) : Promise<Error | null> {
        const result = ankiPost({
            action: 'createModel',
            version: 6,
            params: {
                modelName: model.name,
                inOrderFields: model.fieldNames,
                css: model.css,
                isCloze: false,
                cardTemplates: model.templates.map(tpl => ({Name: tpl.name, Front: tpl.frontTemplate, Back: tpl.backTemplate}))
            }
        });
        return (result instanceof Error) ? result : null;
    }

    async function getModelNames() : Promise<Error | Array<string>> {
        return ankiPost({ action: 'modelNames', 'version': 6 });
    }

    async function ankiPost(requestBody : any) : Promise<Error | any> {
        const data = JSON.stringify(requestBody);
          
        const config = {
            method: 'post', 
            url: getFromConfig('anki-connect-api-url'),
            headers: { 'Content-Type': 'application/json' },
            data: data
        };
        
        try {
            const result = await axios(config);
            if (result.data == null) {
                return new Error(`Got empty response from anki-connect. \nRequest: ${JSON.stringify(data)}`);
            }
            
            if (result.data.error != null) {
                return new Error(`Got error from anki-connect. \nRequest method: ${requestBody.action} \nResponse: ${JSON.stringify(result.data)}`);
            }

            return result.data.result;
        } catch (e) {
            return new Error(`Error while calling anki-connect. \nRequest method: ${requestBody.action} \nError: ${JSON.stringify(e)}`);
        }
    }
}
