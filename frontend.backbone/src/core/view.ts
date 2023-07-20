import { View } from 'backbone';
import { TemplateDelegate } from 'handlebars';

import Model from './model';

/**
 * This is the base view class that all views in the application
 * should derive from, either directly or indirectly. If you want to
 * apply a customization to all views in the application, do it here.
 */
export default class BaseView extends View<Model> {
    template: TemplateDelegate;
}
