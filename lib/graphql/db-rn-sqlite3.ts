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

  run (sql: string, params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.transaction((tx: any) => {
        tx.executeSql(sql, params || [], (t, result) => {
          //todo reject
          resolve()
        })
      })
    })
  }

  rows (sql: string, params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.transaction((tx: any) => {
        tx.executeSql(sql, params || [], (t, result) => {
          //todo reject
          resolve(result.rows.raw())
        })
      })
    })
  }


}
