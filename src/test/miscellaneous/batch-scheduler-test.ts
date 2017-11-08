// tslint:disable:no-unused-expression

import {BatchScheduler, sleep} from '../..';

describe('Feature: BatchScheduler', () => {
  it('Should schedule tasks in batch', async () => {
    let taskExecution = 0;

    let scheduler = new BatchScheduler<string>(async tasks => {
      switch (taskExecution) {
        case 0:
          tasks.should.deep.equal(['a', 'b', 'c']);
          break;
        case 1:
          tasks.should.deep.equal(['d']);
          break;
        default:
          throw new Error();
      }

      await sleep(10);

      taskExecution++;
    });

    await Promise.all([
      scheduler.schedule('a').then(() => {
        if (taskExecution !== 1) {
          throw new Error();
        }
      }),
      scheduler.schedule('b').then(() => {
        if (taskExecution !== 1) {
          throw new Error();
        }
      }),
      scheduler.schedule('c').then(() => {
        if (taskExecution !== 1) {
          throw new Error();
        }
      }),
    ]);

    await scheduler.schedule('d').then(() => {
      if (taskExecution !== 2) {
        throw new Error();
      }
    });
  });

  it('Should schedule tasks in batch', async () => {
    let taskExecution = 0;

    let scheduler = new BatchScheduler<string>(async tasks => {
      switch (taskExecution) {
        case 0:
          tasks.should.deep.equal(['a', 'b', 'c']);
          break;
        case 1:
          tasks.should.deep.equal(['d']);
          break;
        default:
          throw new Error();
      }

      await sleep(50);

      taskExecution++;
    }, 50);

    let a = scheduler.schedule('a').then(() => {
      if (taskExecution !== 1) {
        throw new Error();
      }
    });

    await sleep(10);

    let b = scheduler.schedule('b').then(() => {
      if (taskExecution !== 1) {
        throw new Error();
      }
    });

    await sleep(20);

    let c = scheduler.schedule('c').then(() => {
      if (taskExecution !== 1) {
        throw new Error();
      }
    });

    await sleep(50);

    let d = scheduler.schedule('d').then(() => {
      if (taskExecution !== 2) {
        throw new Error();
      }
    });

    await Promise.all([a, b, c, d]);
  });
});
