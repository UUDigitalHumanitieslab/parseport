import { history } from 'backbone';

import directionRouter from '../global/ex_direction-router';
import directionFsm from '../global/ex_direction-fsm';
import enterView from '../global/ex_enter-view';
import exitView from '../global/ex_exit-view';
import bannerView from '../global/ex_logoBanner';

history.once('route', () => bannerView.render().$el.appendTo(document.body));

directionRouter.on('route:arrive', () => directionFsm.handle('arrive'));
directionRouter.on('route:leave', () => directionFsm.handle('leave'));
directionFsm.on('enter:arriving', () => enterView.render().$el.appendTo('main'));
directionFsm.on('exit:arriving', () => enterView.$el.detach());
directionFsm.on('enter:leaving', () => exitView.render().$el.appendTo('main'));
directionFsm.on('exit:leaving', () => exitView.$el.detach());
