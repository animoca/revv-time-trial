import exitHook from "async-exit-hook";

class ShutdownHook {

  shutdownPromises = [];
  systemShutdownPromises = [];
  addAsyncShutdownHook(asyncFn) {
    // wrap if it is a promise instance 
    if(asyncFn instanceof Promise) {
      asyncFn = () => asyncFn;
    }
    this.shutdownPromises.push(asyncFn);
  }

  addAsyncSystemShutdownHook(asyncFn) {
    if(asyncFn instanceof Promise) {
      asyncFn = () => asyncFn;
    }
    this.systemShutdownPromises.push(asyncFn);
  }

  async execute() {
    const p = this.shutdownPromises.concat(this.systemShutdownPromises).reduce(async (previous, nextFunction) => {
      await previous;
      return nextFunction();
    }, Promise.resolve());
    return await p;
  }
}

const instance = new ShutdownHook();

const asyncShutdownHook = (asyncFn) => instance.addAsyncShutdownHook(asyncFn);

const asyncSystemShutdownHook = (asyncFn) => instance.addAsyncSystemShutdownHook(asyncFn);

exitHook(callback => {
  instance.execute().then(() => callback());
});

export {instance as ShutdownHook, asyncShutdownHook, asyncSystemShutdownHook }