import { Injectable, Inject } from '@nestjs/common';
import { DbModuleOptions } from './db.module';
import { access, readFile, writeFile } from 'fs/promises';

@Injectable()
export class DbService {
  @Inject('DB_OPTIONS')
  private options: DbModuleOptions;

  async read() {
    const path = this.options.path;
    try {
      await access(path);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      return [];
    }

    const str = await readFile(path, { encoding: 'utf-8' });

    if (!str) {
      return [];
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return JSON.parse(str);
  }

  async write(obj: Record<string, any>) {
    await writeFile(this.options.path, JSON.stringify(obj), {
      encoding: 'utf-8',
    });
  }
}
