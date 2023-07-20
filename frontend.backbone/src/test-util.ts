import '@dhl-uu/jquery-promise';

import './global/hbsHelpers';
import { i18nPromise } from './global/i18n';

/**
 * Wrap this in a beforeAll() to enable i18n in all tests of a suite.
 */
export function enableI18n() {
    return i18nPromise;
}
