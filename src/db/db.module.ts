import { Module, DynamicModule } from '@nestjs/common';
import { DbService } from './db.service';

export interface DbModuleOptions {
  path: string;
}

@Module({})
export class DbModule {
  static register(options: DbModuleOptions): DynamicModule {
    return {
      module: DbModule,
      providers: [
        {
          provide: 'DB_OPTIONS',
          useValue: options,
        },
        DbService,
      ],
      exports: [DbService],
    };
  }
}
