import { openDatabase } from 'react-native-sqlite-storage'
import { DbDriver } from 'uport-graph'

const db = openDatabase(
  { name: 'test', location: 'default' },
  () => true,
  () => true,
)

db.transaction((tx) => {
  tx.executeSql('CREATE TABLE IF NOT EXISTS nodes (did TEXT)', [], (tx, results) => {
      console.log("Query completed")
    })
})

class RnSqlite implements DbDriver {
  private db: any

  constructor(db: any) {
    this.db = db
  }

  all (sql: string, params: any, callback: (err: any, values: [any]) => void) {
      this.db.transaction((tx: any) => {
        tx.executeSql(sql, params || [], (t, result) => {
          callback(null, result.rows.raw())
        })
      })
  }

}

export const driver = new RnSqlite(db)
