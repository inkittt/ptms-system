import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { ConfigModule } from '@nestjs/config';
import { LocalStorageAdapter } from './adapters/local-storage.adapter';
import { SupabaseStorageAdapter } from './adapters/supabase-storage.adapter';

@Module({
  imports: [ConfigModule],
  providers: [
    StorageService,
    LocalStorageAdapter,
    SupabaseStorageAdapter,
  ],
  exports: [StorageService],
})
export class StorageModule {}
