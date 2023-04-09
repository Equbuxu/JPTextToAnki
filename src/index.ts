import * as WordExtractor from './text-word-extractor';
import * as CachedJisho from './cached-jisho';
import { WordCardModel, CreateModelForWord } from './models/word-card-model';
import * as fs from 'fs';
import { KanjiCardModel } from './models/kanji-card-model';
import * as WordCardView from './views/word-card-view';
import { CreateKanjiCardsForWords } from './models/kanji-card-model';
import * as KanjiCardView from './views/kanji-card-view';    
import { getFromConfig } from './config';
import * as path from 'path';
import { AnkiApi } from './anki-api';

start();

async function start() {
    const ankiPrepResult = await AnkiApi.uploadNoteModels();
    if (ankiPrepResult instanceof Error) {
        console.log('Error while preparing Anki, aborting. Error:');
        console.log(ankiPrepResult.message);
        return;
    }

    const configPath = getFromConfig('input');
    
    const files = getFileOrAllFiles(configPath);
    if (files === null) {
        console.log("Error: no files to process");
        return;
    }
    for (const filepath of files) {
        console.log(`Processing file ${filepath}`);
        await processFile(filepath);
    }
}

async function processFile(path: string) {
    const inputText = fs.readFileSync(path, 'utf8');
    console.log('Looking for words...');
    const words = await extractWordsFromText(inputText);
    if (words === undefined) {
        console.log('Error! Invalid config.');
        return;
    }

    console.log('Fetching info for word cards...');
    const wordModels: WordCardModel[] = await fetchWordCards(words);

    console.log('Fetching info for kanji cards... (processing all at once, without progress indication)');
    const kanjiModels = await fetchKanjiCards(wordModels);
    
    console.log('Creating cards...');
    const wordCards = wordModels.map(model => WordCardView.GetNote(model));
    const kanjiCards = kanjiModels.map(model => KanjiCardView.GetNote(model));

    const finalDeckName = getFilename(path);
    
    if (wordCards.length > 0){
        const wordSendResult = await AnkiApi.sendNotesToAnki(wordCards, 'Generated Words::' + finalDeckName, wordCards[0].noteModel.name);
        if (wordSendResult != null) {
            console.log(`Sent ${wordCards.length} word cards to anki, with ${wordSendResult.length} errors. First error: ${wordSendResult[0].message}`);
        }
    }
    
    if (kanjiCards.length > 0) {
        const kanjiSendResult = await AnkiApi.sendNotesToAnki(kanjiCards, 'Generated Kanji::' + finalDeckName, kanjiCards[0].noteModel.name);
        if (kanjiSendResult != null) {
            console.log(`Sent ${kanjiCards.length} kanji cards to anki, with ${kanjiSendResult.length} errors. First error: ${kanjiSendResult[0].message}`);
        }
    }
        
    console.log('Done...');
}

function getFilename(path: string): string | null {
    const parts = path.replace(/\\/g, '/').split('/');
    if (parts.length == 0) {
        return null;
    }
    return parts[parts.length - 1].split('.')[0];
}

function getFileOrAllFiles(configPath: string): string[] | null {
    if (!fs.existsSync(configPath)) {
        return null;
    }
    const isDirectory = fs.lstatSync(configPath).isDirectory();
    if (!isDirectory) {
        return [configPath];
    }
    return fs.readdirSync(configPath, {withFileTypes: true})
        .filter(file => file.isFile())
        .map(file => path.resolve(configPath, file.name));
}

async function fetchKanjiCards(wordModels: WordCardModel[]): Promise<KanjiCardModel[]> {
    const kanjiModels = await CreateKanjiCardsForWords(wordModels);

    CachedJisho.saveCache();
    return kanjiModels;
}

async function fetchWordCards(words: string[]): Promise<WordCardModel[]> {
    const wordModels: WordCardModel[] = [];
    for (const word of words) {
        const model = await CreateModelForWord(word);
        if (model === null) {
            continue;
        }
        console.log(`${word}, `);
        wordModels.push(model);
    }
    CachedJisho.saveCache();
    return wordModels;
}

async function extractWordsFromText(text: string): Promise<string[] | undefined> {
    const type: string = getFromConfig("input-type");
    if (type === "text-nagisa") {
        return WordExtractor.ExtractWordsFromText_nagisa(text);
    } else if (type === "text-tiny-segmenter") {
        return WordExtractor.ExtractWordsFromText_TinySegmenter(text);
    } else if (type == "word-list") {
        return WordExtractor.PreprocessWordsFromWordList(text.replace(/\r/g, '').split('\n'));
    }
    return undefined;
}