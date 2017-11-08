import {NodeStyleCallback, async} from '../..';

describe('Feature: async', () => {
  interface InvocationData {
    this: any;
    args: any[];
  }

  interface InvocationOptions {
    error?: any;
    sync?: boolean;
  }

  let fn = async<InvocationData>(function(
    this: any,
    options = {} as InvocationOptions,
    ...args: any[]
  ) {
    let callback = args.pop() as NodeStyleCallback<any>;

    callback.should.be.an.instanceOf(Function);

    let {error, sync} = options;

    if (sync) {
      if (error) {
        callback(error);
      } else {
        callback(undefined, {
          this: this,
          args,
        });
      }
    } else {
      if (error) {
        setImmediate(callback, error);
      } else {
        setImmediate(callback, undefined, {
          this: this,
          args,
        });
      }
    }
  });

  it('Should invoke successfully with asynchronous callback', async () => {
    let thisArg = {};
    let ret = fn.call(thisArg, undefined, 1, 2);

    ret.should.be.an.instanceOf(Promise);

    let result = await ret;

    result.should.deep.equal({
      this: thisArg,
      args: [1, 2],
    });
  });

  it('Should invoke successfully with synchronous callback', async () => {
    let thisArg = {};
    let ret = fn.call(thisArg, {sync: true} as InvocationOptions, 1, 2);

    ret.should.be.an.instanceOf(Promise);

    let result = await ret;

    result.should.deep.equal({
      this: thisArg,
      args: [1, 2],
    });
  });

  it('Should invoke failed with asynchronous callback', async () => {
    let error = new Error();
    let ret = fn({error} as InvocationOptions, 1, 2);
    await ret.should.be.rejectedWith(error);
  });

  it('Should invoke successfully with synchronous callback', async () => {
    let error = new Error();
    let ret = fn({sync: true, error} as InvocationOptions, 1, 2);
    await ret.should.be.rejectedWith(error);
  });
});
