import * as fs from 'fs';
import path from 'path';
import { CardTemplate, NoteModel } from './note-model';

const config = JSON.parse(fs.readFileSync('files/config.json', 'utf8'));

interface NoteModelData {
    fields: string[];
    cardTemplates: Array<{Name: string, FrontFilename: string, BackFilename: string, StyleFilename: string}>;
}

const noteModels: NoteModel[] = readNoteModelsSync('files/note-models');
function readNoteModelsSync(directoryPath: string): Array<NoteModel> {
    return fs.readdirSync(directoryPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(({ name }) => {
            const data: NoteModelData = JSON.parse(fs.readFileSync(path.join(directoryPath, name, 'data.json'), 'utf-8'));
            const templates = data.cardTemplates.map(tpl => {
                const backTemplate = fs.readFileSync(path.join(directoryPath, name, tpl.BackFilename), 'utf-8');
                const frontTemplate = fs.readFileSync(path.join(directoryPath, name, tpl.FrontFilename), 'utf-8');
                return new CardTemplate(tpl.Name, frontTemplate, backTemplate);
            })
            const style = fs.readFileSync(path.join(directoryPath, name, 'style.css'), 'utf-8');
            
            return new NoteModel(name, style, templates, data.fields);
        });
}

export module Config {
    export function getNoteModels() : NoteModel[] {
        return noteModels;
    }

    export function getFromConfig(key: string): any {
        return config[key];
    }
}

export function getFromConfig(key: string): any {
    return config[key];
}