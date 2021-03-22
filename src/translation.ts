
const arrayCopy = <T>(a: T[]): T[] => a.slice();
const first = <T>(l: T[], n: number): T[] => l.slice(0, n);

// see https://flaviocopes.com/how-to-shuffle-array-javascript/
const shuffle = <T>(l: T[]): T[] => {
    const copy = arrayCopy(l);
    return copy.sort(x => Math.random() -0.5);
};

const deduplicateConsecutive = <T>(l: T[]): T[] => {
    const copy = arrayCopy(l);
    return copy.filter((it, pos, ar) => pos === 0 || it !== ar[pos-1]);
};

const callTranslateApi = async (url: string, text: string, from: string, to: string) => {
        const data :any = {
            target: to,
            q: text,
            format: 'text'
        };
        if (!!from) {
            data.source = from;
        }
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        if (response.body === null) {
            throw Error("No response");
        }
        const r = await response.json();
        var translated = r.data.translations[0].translatedText;
        return translated;
};

export interface TranslationOptions {
    apiKey: string
    firstLanguage: string
    finalLanguage: string
    iterations: number
};

const LANGUAGES = [
        'af',
        'sq',
        'am',
        'ar',
        'hy',
        'az',
        'eu',
        'be',
        'bn',
        'bs',
        'bg',
        'ca',
        'ceb',
        'zh-CN',
        'zh-TW',
        'co',
        'hr',
        'cs',
        'da',
        'nl',
        'en',
        'eo',
        'et',
        'fi',
        'fr',
        'fy',
        'gl',
        'el',
        'gu',
        'ht',
        'ha',
        'haw',
        'he',
        'hi',
        'hmn',
        'hu',
        'is',
        'ig',
        'id',
        'ga',
        'it',
        'ja',
        'jv',
        'kn',
        'kk',
        'km',
        'ko',
        'ku',
        'ky',
        'lo',
        'la',
        'lv',
        'lt',
        'lb',
        'mk',
        'mg',
        'ms',
        'ml',
        'mt',
        'mi',
        'mr',
        'mn',
        'my',
        'ne',
        'no',
        'ny',
        'ps',
        'fa',
        'pl',
        'pt',
        'pa',
        'ro',
        'ru',
        'sm',
        'gd',
        'sr',
        'st',
        'sn',
        'sd',
        'si',
        'sk',
        'sl',
        'so',
        'es',
        'su',
        'sw',
        'sv',
        'tl',
        'tg',
        'ta',
        'te',
        'th',
        'tr',
        'uk',
        'ur',
        'uz',
        'vi',
        'cy',
        'xh',
        'yi',
        'yo',
        'zu'
];

const getUrl = (apiKey: string) =>
    'https://translation.googleapis.com/language/translate/v2?key=' + apiKey;

const selectRandomLanguages = (n: number): string[] => first(shuffle(LANGUAGES), n);

export const translate = async (toTranslateString: string, options: TranslationOptions) => {
    const toTranslate = toTranslateString
        .replace(/\r?\n/g, '\n')
        .replace(/\n\n+/g, '\n\n')
        .split('\n\n')
        .filter(t => t.length > 0 && t.match(/\S+/g))
        ;

    const promises = toTranslate.map(async (t) => {
        try {
            return await translateBlockAsync(t, options)
        } catch (e) {
            console.error(e);
            return e.toString();
        }
    });
    const results = Promise.all(promises);
    return results;
};

const translateBlockAsync = async (block: string, options: TranslationOptions) => {
    const translateNext = async (message: string, languages: string[]): Promise<string> => {
        if (languages.length < 2) {
            return message;
        }

        const from = languages.shift() || "";
        const to = languages[0];

        var url = getUrl(options.apiKey);
        const translatedMessage = await callTranslateApi(url, message, from, to);
        return translateNext(translatedMessage, languages);
    };


    const selectedLanguages = deduplicateConsecutive(
        [options.firstLanguage].concat(
            selectRandomLanguages(options.iterations),
            [ options.finalLanguage ]));
    console.log("translation sequence", selectedLanguages);
    return translateNext(block, selectedLanguages);
}
