import Handlebars from 'handlebars/dist/handlebars.runtime';
import registerI18nHelper from 'handlebars-i18next';

import staticHelper from '../core/static';
import { i18next } from './i18n';

/**
 * Handlebars helper allowing you to do {{i18n 'key'}} in templates.
 *
 * See the README of the handlebars-i18next package for details.
 */
registerI18nHelper(Handlebars, i18next);

/**
 * {{static 'path/to/file.ext'}} will prefix the given path with
 * config.staticRoot.
 */
Handlebars.registerHelper('static', staticHelper);
