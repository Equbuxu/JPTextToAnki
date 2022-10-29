declare module 'tiny-segmenter' {
    class TinySegmenter {
        constructor();
        segment(input: string) : string[];
    }
    export = TinySegmenter;
}