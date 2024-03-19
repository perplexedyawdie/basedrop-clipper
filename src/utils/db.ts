import Dexie, { Table } from 'dexie';

export interface Baseboard {
  id?: number;
  name: string;
  data: string;
}

export class MySubClassedDexie extends Dexie {
  baseboards!: Table<Baseboard>;

  constructor() {
    super('basedrop');
    this.version(1).stores({
        baseboards: '++id, name, data' // Primary key and indexed props
    });
  }
}

export const db = new MySubClassedDexie();