import Handlebars from 'handlebars/dist/handlebars.runtime';

import { staticRoot } from 'config.json';

export default function staticHelper(path) {
    return new Handlebars.SafeString(staticRoot + path);
}
