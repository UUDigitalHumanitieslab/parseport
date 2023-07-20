import { Collection as BackboneCollection } from 'backbone';
import { extend } from 'lodash';

import Model from './model';
import { syncWithCSRF } from './csrf';

/**
 * This is the base collection class that all collections in the
 * application should derive from, either directly or indirectly. If
 * you want to apply a customization to all collections in the
 * application, do it here.
 */
export default class Collection extends BackboneCollection<Model> {};

extend(Collection.prototype, {
    model: Model,
    sync: syncWithCSRF,
});
