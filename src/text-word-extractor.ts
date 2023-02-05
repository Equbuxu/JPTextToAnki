import TinySegmenter from "tiny-segmenter";
import { WordHelper } from "./word-helper";
import axios from 'axios';
import { getFromConfig } from "./config";

const segmenter = new TinySegmenter();
const kanaAndKanjiRegex = /[一-龯ぁ-んァ-ン]/g;

export function ExtractWordsFromText_TinySegmenter(inputText: string): string[] {
    let segments = segmenter.segment(inputText);
    return PreprocessWordsFromWordList(segments);
}

export async function ExtractWordsFromText_nagisa(inputText: string): Promise<string[]> {
    const wordList: string = (await axios.get(getFromConfig("nagisa-api-url"), { params: { text: inputText } })).data;
    let split = wordList.split('\n');
    return PreprocessWordsFromWordList(split);
}

export function PreprocessWordsFromWordList(inputWords: string[]): string[] {
    let rawWords = removeNonJapaneseAndDuplicates(inputWords);
    return rawWords;
}

function removeNonJapaneseAndDuplicates(segments: string[]): string[] {
    return WordHelper.removeDuplicateStrings(
        segments.filter(val => {
        if (val.length == 0)
            return false;
        if (val.length == 1)
            return val.match(WordHelper.kanjiRegex) != null;
        return val.match(kanaAndKanjiRegex) != null;
    }));
}