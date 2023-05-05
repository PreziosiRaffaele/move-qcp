import { expect, test } from '@oclif/test';

describe('cpq qcp deploy', () => {
  test
    .stdout()
    .command(['cpq qcp deploy'])
    .it('runs hello', (ctx) => {
      expect(ctx.stdout).to.contain('hello world');
    });

  test
    .stdout()
    .command(['cpq qcp deploy', '--name', 'Astro'])
    .it('runs hello --name Astro', (ctx) => {
      expect(ctx.stdout).to.contain('hello Astro');
    });
});
