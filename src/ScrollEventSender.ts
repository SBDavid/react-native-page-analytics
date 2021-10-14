import EventEmitter from 'eventemitter3';

export default class ScrollEventSender {
  static emitter = new EventEmitter();

  static addListener(handler: (e: any) => void) {
    ScrollEventSender.emitter.addListener('scroll', handler);
    ScrollEventSender.emitter.addListener('refreshed', handler);
    ScrollEventSender.emitter.addListener('hide', handler);
    ScrollEventSender.emitter.addListener('show', handler);
  }

  static removeListener(handler: (e: any) => void) {
    ScrollEventSender.emitter.removeListener('scroll', handler);
    ScrollEventSender.emitter.removeListener('refreshed', handler);
    ScrollEventSender.emitter.removeListener('hide', handler);
    ScrollEventSender.emitter.removeListener('show', handler);
  }

  static send(id: String, name: 'scroll' | 'refreshed' | 'hide' | 'show') {
    ScrollEventSender.emitter.emit(name, { id, name });
  }
}
