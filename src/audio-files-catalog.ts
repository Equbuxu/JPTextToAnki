import * as fs from 'fs';

export class AudioFileData {
    source!: string;
    audio_jap!: string;
    jap!: string;
    eng!: string;
}

const audioFilesCatalog : Array<AudioFileData> = JSON.parse(fs.readFileSync('files/audioFilesCatalog.json', 'utf8'));

export module AudioFilesCatalog {
    export function search(text : string, limit : number) : Array<AudioFileData> {
        const ordered = audioFilesCatalog.filter(a => a && a.jap.includes(text)).sort((a, b) => a.jap.length - b.jap.length);
        return ordered.slice(0, Math.min(ordered.length, limit));
    }
}