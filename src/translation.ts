
const arrayCopy = <T>(a: T[]): T[] => a.slice();
const first = <T>(l: T[], n: number): T[] => l.slice(0, n);

// see https://flaviocopes.com/how-to-shuffle-array-javascript/
const shuffle = <T>(l: T[]): T[] => {
    const copy = arrayCopy(l);
    return copy.sort(x => Math.random() -0.5);
};

const translateAsync = async (url: string, text: string, from: string, to: string) => {
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



export class Translation {
    public toTranslate = '';
    public apiKey = '';
    public firstLanguage = 'de';
    public finalLanguage = 'de';

    LANGUAGES = [
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

    getUrl(apiKey: string) {
        return 'https://translation.googleapis.com/language/translate/v2?key=' + apiKey;
    }

    selectRandomLanguages(n: number): string[] {
        return first(shuffle(this.LANGUAGES), n);
    }

    async startTranslation() {
        const toTranslate = this.toTranslate
            .replace(/\r?\n/g, '\n')
            .split('\n\n');

        const promises = toTranslate.map(async (t) => {
            try {
                return await this.translateAsync(t)
            } catch (e) {
                console.error(e);
                return e.toString();
            }
        });
        const results = Promise.all(promises);
        return results;
    }

    private async translateAsync(block: string) {
        const selectedLanguages = 
            [this.firstLanguage].concat(
                this.selectRandomLanguages(20),
                [ this.finalLanguage ]
            );
        console.log("translation sequence", selectedLanguages);
        return this.translateNext(block, selectedLanguages);
    }

    private async translateNext(message: string, languages: string[]): Promise<string> {
        if (languages.length < 2) {
            return message;
        }

        const from = languages.shift() || "";
        const to = languages[0];

        var url = this.getUrl(this.apiKey);
        const translatedMessage = await translateAsync(url, message, from, to);
        return this.translateNext(translatedMessage, languages);
    }
}