import { Deferred } from 'jquery';
import * as i18next from 'i18next';
import * as languageDetector from 'i18next-browser-languagedetector';

import * as english from '../i18n/en.json';
import * as dutch from '../i18n/nl.json';

const deferred = Deferred();
const i18nPromise = deferred.promise();

i18next.use(
    languageDetector
).init({
    resources: {
        en: {
            translation: english,
        },
        nl: {
            translation: dutch,
        },
    },
}, function(error, t) {
    if (error) {
        deferred.reject(error);
    } else {
        deferred.resolve(i18next);
    }
});

export { i18nPromise, i18next };
