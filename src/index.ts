import * as WordExtractor from './text-word-extractor';
import * as CachedJisho from './cached-jisho';
import { WordCardModel, CreateModelForWord } from './models/word-card-model';
import * as fs from 'fs';
import { init, KanjiCardModel } from './models/kanji-card-model';
import * as WordCardView from './views/word-card-view';
import { encodeCardsAsCsv } from './card-encoder';
import { CreateKanjiCardsForWord } from './models/kanji-card-model';
import * as KanjiCardView from './views/kanji-card-view';    
import { getFromConfig } from './config';

run();
async function run() {
    await init();

    const inputText = fs.readFileSync(getFromConfig('input'), 'utf8');
    console.log('Looking for words...');
    const words = await extractWordsFromText(inputText);
    if (words === undefined) {
        console.log('Error! Invalid config.');
        return;
    }

    console.log('Fetching info for word cards...');
    const wordModels: WordCardModel[] = await fetchWordCards(words);

    console.log('Fetching info for kanji cards...');
    const kanjiModels = await fetchKanjiCards(wordModels);
    
    console.log('Creating cards...');
    const wordCards = wordModels.map(model => WordCardView.GetCard(model));
    const wordDeck = encodeCardsAsCsv(wordCards);

    const kanjiCards = kanjiModels.map(model => KanjiCardView.GetCard(model));
    const kanjiDeck = encodeCardsAsCsv(kanjiCards);

    fs.writeFileSync("files/output/output-words.txt", wordDeck, "utf-8");
    fs.writeFileSync("files/output/output-kanji.txt", kanjiDeck, "utf-8");
    console.log('Done...');
}

async function fetchKanjiCards(wordModels: WordCardModel[]): Promise<KanjiCardModel[]> {
    const kanjiModels: KanjiCardModel[] = []
    for (const word of wordModels) {
        const models = await CreateKanjiCardsForWord(wordModels, word);
        models.forEach(model => console.log(`${model.kanji}, `));
        kanjiModels.push(...models);
    }
    CachedJisho.saveCache();
    return kanjiModels
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
    if (type === "text-nagato") {
        return WordExtractor.ExtractWordsFromText_Nagato(text);
    } else if (type === "text-tiny-segmenter") {
        return WordExtractor.ExtractWordsFromText_TinySegmenter(text);
    }
    return undefined;
}