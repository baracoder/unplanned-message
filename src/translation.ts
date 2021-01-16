
const arrayCopy = <T>(a: T[]): T[] => a.slice();
const first = <T>(l: T[], n: number): T[] => l.slice(0, n);

// see https://flaviocopes.com/how-to-shuffle-array-javascript/
const shuffle = <T>(l: T[]): T[] => {
    const copy = arrayCopy(l);
    return copy.sort(x => Math.random() -0.5);
};

const translateAsync = async (url: string, text: string, from: string, to: string) => {
        const data = {
            target: to,
            q: text,
            format: 'html'
        };
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        try {
            if (response.body === null) {
                throw Error("No response");
            }
            const text = await response.body.getReader().read();
            var r = JSON.parse(new TextDecoder('utf-8').decode(text.value));
            var translated = r.data.translations[0].translatedText;
            return translated;
        } catch (e) {
            console.error(e);
            return 'error';
        }
};



export class Translation {
    public toTranslate = '';
    public translated = '';
    public apiKey = '';

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
        this.translated = '';
        const toTranslate = this.toTranslate
            .replace(/\r?\n/g, '<br />')
            .split('<br /><br />');

        for (let i = 0; i < toTranslate.length; i++) {
            const res = await this.translateAsync(toTranslate[i]);
            this.translated += '<br/><br/>' + res;
        }
    }

    private async translateAsync(block: string) {
        const selectedLanguages = 
            ['de'].concat(
                this.selectRandomLanguages(20),
                [ 'de' ]
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