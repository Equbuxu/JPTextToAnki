import axios from 'axios';
import { Card, CardAudio } from './card';
import { Config, getFromConfig } from './config';

export module AnkiApi {
    export const kanjiModelName : string = 'JPTextToAnki-Kanji';
    export const wordModelName : string = 'JPTextToAnki-Word';

    export async function sendCardsToAnki(cards : Card[], deckName : string, modelName : string) : Promise<null | Array<Error>> {
        const existingDecks = await deckNames();
        if (existingDecks instanceof Error) return [existingDecks];

        if (!existingDecks.includes(deckName)) {
            const creationResult = await createDeck(deckName);
            if (creationResult instanceof Error) return [creationResult];
        }

        const errors : Array<Error> = [];
        for (const card of cards) {
            const fields : any = {};
            fields[card.frontFieldName] = card.frontHtml;
            fields[card.backFieldName] = card.backHtml;
            for (const audio of card.audio) {
                const storeMediaResult = await storeMediaFile(audio.audioFilename, audio.audioPath);
                if (storeMediaResult instanceof Error) {
                    errors.push(storeMediaResult);
                }
            }
            const addResult = await addNote(deckName, modelName, fields);
            if (addResult instanceof Error) {
                errors.push(addResult);
            }
        }
        if (errors.length > 0)
            return errors;
        return null;
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

    export async function prepareNoteTypes() : Promise<Error | null> {
        const modelNames = await getModelNames();
        if (modelNames instanceof Error) return modelNames;
        
        if (!modelNames.includes(kanjiModelName)) {
            const res = await createKanjiModel();
            if (res instanceof Error) return res;
        }

        if (!modelNames.includes(wordModelName)) {
            const res = await createWordModel();
            if (res instanceof Error) return res;
        }
        return null;
    }

    async function createKanjiModel() : Promise<Error | null> {
        const frontString = '<span class="card-front">{{Kanji}}</span>';
        const backStrign = 
`{{FrontSide}}

<hr id=answer>

{{Back}}`;

        const result = ankiPost({
            action: 'createModel',
            version: 6,
            params: {
                modelName: kanjiModelName,
                inOrderFields: ['Kanji', 'Back'],
                css: Config.getNoteStyle(),
                isCloze: false,
                cardTemplates: [
                    {
                        Name: 'Kanji Card',
                        Front: frontString,
                        Back: backStrign
                    }
                ]
            }
        });
        return (result instanceof Error) ? result : null;
    }

    async function createWordModel() : Promise<Error | null> {
        const frontString = '<span class="card-front">{{Word}}</span>';
        const backStrign = 
`{{FrontSide}}

<hr id=answer>

{{Back}}`;

        const result = ankiPost({
            action: 'createModel',
            version: 6,
            params: {
                modelName: wordModelName,
                inOrderFields: ['Word', 'Back'],
                css: Config.getNoteStyle(),
                isCloze: false,
                cardTemplates: [
                    {
                        Name: 'Word Card',
                        Front: frontString,
                        Back: backStrign
                    }
                ]
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

            if (result.data.result == null) {
                return new Error(`Got no result from anki-connect. \nRequest method: ${requestBody.action} \nResponse: ${JSON.stringify(result.data)}`);
            }

            return result.data.result;
        } catch (e) {
            return new Error(`Error while calling anki-connect. \nRequest method: ${requestBody.action} \nError: ${JSON.stringify(e)}`);
        }
    }
}
