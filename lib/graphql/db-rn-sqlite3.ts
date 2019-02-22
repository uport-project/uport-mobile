import sqlite3 = require('sqlite3')
import { DbDriver } from 'uport-graph'

const db = new sqlite3.Database('test-db')
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS nodes (did TEXT)`)
})

class RnSqlite implements DbDriver {
  private db: any

  constructor(db) {
    this.db = db
  }

  all (sql: string, params: any, callback: (err: any, values: [any]) => void) {
    this.db.all(sql, params || [], callback)
  }

}

export const driver = new RnSqlite(db)