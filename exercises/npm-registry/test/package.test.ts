import * as getPort from 'get-port';
import got from 'got';
import { Server } from 'http';
import { createApp } from '../src/app';
import { inspect } from 'util';

describe('/package/:name/:version endpoint', () => {
  let server: Server;
  let port: number;

  beforeAll(async (done) => {
    port = await getPort();
    server = createApp().listen(port, done);
  });

  afterAll((done) => {
    server.close(done);
  });

  it('responds', async () => {
    const packageName = 'react';
    const packageVersion = '16.13.0';

    const res: any = await got(
      `http://localhost:${port}/package/${packageName}/${packageVersion}`,
    ).json();

    console.log(inspect(res, false, null, true /* enable colors */))
    expect(res.name).toEqual(packageName);
  });

  it('returns dependencies', async () => {
    const packageName = 'react';
    const packageVersion = '16.13.0';

    const res: any = await got(
      `http://localhost:${port}/package/${packageName}/${packageVersion}`,
    ).json();

    console.log(inspect(res, false, null, true /* enable colors */))
    expect(res.dependencies).toEqual({
      'loose-envify': {
        name: 'loose-envify',
        version: '^1.1.0',
        dependencies: {
          'js-tokens': {
            name: 'js-tokens',
            version: '^1.0.1' } }
      },
      'object-assign': {
        name: 'object-assign',
        version: '^4.1.1' },
      'prop-types': {
        name: 'prop-types',
        version: '^15.6.2',
        dependencies: {
          'loose-envify': {
            name: 'loose-envify',
            version: '^1.3.1',
            dependencies: {
              'js-tokens': {
                name: 'js-tokens',
                version: '^3.0.0' } }
          },
          'object-assign': {
            name: 'object-assign',
            version: '^4.1.1' }
        }
      }
    })
  });

  it('hits cache', async () => {
    const packageName = 'react';
    const packageVersion = '16.13.0';

    const res1: any = await got(
        `http://localhost:${port}/package/${packageName}/${packageVersion}`,
    ).json();

    expect(res1.name).toEqual(packageName);

    const res2: any = await got(
        `http://localhost:${port}/package/${packageName}/${packageVersion}`,
    ).json();

    expect(res2.name).toEqual(packageName);
  });
});
