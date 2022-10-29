import * as fs from 'fs';

const config = JSON.parse(fs.readFileSync('files/config.json', 'utf8'));

export function getFromConfig(key: string): any {
    return config[key];
}