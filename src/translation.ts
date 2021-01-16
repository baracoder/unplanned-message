export class Translation {
    public toTranslate = '';
    public selectedLanguages: string[] = [];
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

    selectRandomLanguage(list: string[], remainingIterations: number) {
        if (remainingIterations === 0) {
            list.push('en');
            return list;
        }
        let i = Math.floor(Math.random() * this.LANGUAGES.length);
        let lang = this.LANGUAGES[i];
        if (list.includes(lang)) {
            this.selectRandomLanguage(list, remainingIterations);
        } else {
            list.push(lang);
            this.selectRandomLanguage(list, --remainingIterations);
        }
    }

    async startTranslation() {
        this.translated = '';
        const toTranslate = this.toTranslate
            .replace(/\r?\n/g, '<br />')
            .split('<br /><br />');

        for (let i = 0; i < toTranslate.length; i++) {
            await this.asynchTranslate(toTranslate[i]);
        }
    }

    private async asynchTranslate(block: string) {
        this.selectedLanguages = ['de'];
        this.selectRandomLanguage(this.selectedLanguages, 20);
        await this.translateNext(block, 0);
    }

    private translateNext(message: string, index: number): any {
        if (this.selectedLanguages.length <= index + 1) {
            this.translated += '<br /><br />' + message;
            return;
        }
        const langs = this.getCurrentLanguages(index);
        var url = this.getUrl(this.apiKey);
        var data = {
            target: langs[1],
            q: message,
            format: 'html'
        };
        return fetch(url, {
            method: 'POST',
            body: JSON.stringify(data)
        }).then(response => {
            try {
                if (response.body === null) {
                    throw Error("No response");
                }
                return response.body
                    .getReader()
                    .read()
                    .then(text => {
                        var r = JSON.parse(new TextDecoder('utf-8').decode(text.value));
                        var translated = r.data.translations[0].translatedText;
                        return this.translateNext(translated, index + 1);
                    });
            } catch (e) {
                console.log(e);
            }
        });
    }

    getCurrentLanguages(index: number) {
        return this.selectedLanguages.slice(index, index + 2);
    }
}