import * as fs from 'fs';

const config = JSON.parse(fs.readFileSync('files/config.json', 'utf8'));
const noteStyle = fs.readFileSync('files/note-style.css', 'utf8');

export module Config {
    export function getNoteStyle() : string{
        return noteStyle;
    }

    export function getFromConfig(key: string): any {
        return config[key];
    }
}

export function getFromConfig(key: string): any {
    return config[key];
}