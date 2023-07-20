// This module only exists to illustrate what to do if you need to
// create a customized intermediate base class.

import Model from './model';

export type FancynessLevel = 'low' | 'moderate' | 'high';

export default class FancyModel extends Model {
    level: FancynessLevel = 'moderate';
}
