import { KanjiModel } from "../models/models-common";

export module ViewsCommon {    
    export function createKanjiView(model: KanjiModel): string {
        return '' + 
        `<div>
            <div>
                <a href="${encodeURI('https://kanji.koohii.com/study/kanji/' + model.kanji)}">${model.kanji}</a>
                ${model.jlpt == null ? '' : `(${model.jlpt})`}: ${model.meaning}
            </div>

            ${model.kun.length == 0 ? '' : 
            `<div>
                Kun: ${model.kun.join(', ')}
            </div>`}

            ${model.on.length == 0 ? '' : 
            `<div>
                On: ${model.on.join(', ')}
            </div>`}
        </div>
        `;
    }
}