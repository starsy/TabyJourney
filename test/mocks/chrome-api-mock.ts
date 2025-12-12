import type { StorageAPI } from '@/types/chrome-api';

/**
 * Chrome Storage API のモック実装
 */
export class MockStorageAPI implements StorageAPI {
  private storage: Record<string, unknown> = {};

  async get(keys: string | string[] | null): Promise<Record<string, unknown>> {
    if (keys === null) {
      return { ...this.storage };
    }

    const keyArray = Array.isArray(keys) ? keys : [keys];
    const result: Record<string, unknown> = {};

    for (const key of keyArray) {
      if (key in this.storage) {
        result[key] = this.storage[key];
      }
    }

    return result;
  }

  async set(items: Record<string, unknown>): Promise<void> {
    Object.assign(this.storage, items);
  }

  async remove(keys: string | string[]): Promise<void> {
    const keyArray = Array.isArray(keys) ? keys : [keys];
    for (const key of keyArray) {
      delete this.storage[key];
    }
  }

  async clear(): Promise<void> {
    this.storage = {};
  }

  /**
   * テスト用: ストレージの内容を取得
   */
  getStorage(): Record<string, unknown> {
    return { ...this.storage };
  }

  /**
   * テスト用: ストレージをリセット
   */
  reset(): void {
    this.storage = {};
  }
}

/**
 * Chrome Storage API のモックファクトリー
 */
export function createMockStorageAPI(): MockStorageAPI {
  return new MockStorageAPI();
}
