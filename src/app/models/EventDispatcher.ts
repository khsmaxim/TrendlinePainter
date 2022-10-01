// https://stackoverflow.com/questions/51681107/create-custom-event-within-class-in-typescript
// https://github.com/vitaly-t/sub-events
// https://rjzaworski.com/2019/10/event-emitters-in-typescript

export type Handler<E> = (event: E) => void;

export class EventDispatcher<E> {
    private handlers: Handler<E>[] = [];
    fire(event: E) {
      for (let h of this.handlers)
        h(event);
    }
    register(handler: Handler<E>) {
      this.handlers.push(handler);
    }
}
