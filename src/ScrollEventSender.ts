import EventEmitter from 'eventemitter3';

export default class ScrollEventSender {
  static emitter = new EventEmitter();

  static addListener(handler: (e: any) => void) {
    ScrollEventSender.emitter.addListener('scroll', handler);
    ScrollEventSender.emitter.addListener('refreshed', handler);
    ScrollEventSender.emitter.addListener('hide', handler);
    ScrollEventSender.emitter.addListener('show', handler);
    ScrollEventSender.emitter.addListener('disable', handler);
    ScrollEventSender.emitter.addListener('enable', handler);
  }

  static removeListener(handler: (e: any) => void) {
    ScrollEventSender.emitter.removeListener('scroll', handler);
    ScrollEventSender.emitter.removeListener('refreshed', handler);
    ScrollEventSender.emitter.removeListener('hide', handler);
    ScrollEventSender.emitter.removeListener('show', handler);
    ScrollEventSender.emitter.removeListener('disable', handler);
    ScrollEventSender.emitter.removeListener('enable', handler);
  }

  static send(id: String, name: 'scroll' | 'refreshed' | 'hide' | 'show' | 'disable' | 'enable') {
    // console.info('ScrollEventSender', id, name);
    ScrollEventSender.emitter.emit(name, { id, name });
  }
}
