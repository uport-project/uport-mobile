import { openDatabase } from 'react-native-sqlite-storage'
import { DbDriver } from 'uport-graph-api'

export class RnSqlite implements DbDriver {
  private db: any

  initialize(): Promise<any> {
    const setDb = (db: any) => {
      this.db = db
    }

    return new Promise((resolve, reject) => {
      const db = openDatabase(
        { name: 'test', location: 'default' },
        () => {
          setDb(db)
          resolve()
        },
        reject,
      )
    })
  }

  all (sql: string, params: any, callback: (err: any, values: [any]) => void) {
      this.db.transaction((tx: any) => {
        tx.executeSql(sql, params || [], (t, result) => {
          callback(null, result.rows.raw())
        })
      })
  }

}
