class SqliteDbLoader {
    constructor() {
        this.PATH_WASM = `lib/sql.js/1.7.0`
        this.SQL = null
        this.DB = null
    }
    async load(path='./db/mylog.db') {
        if (!this.DB) {
            this.SQL = await initSqlJs({locateFile: file => `${this.PATH_WASM}/${file}`})
            const res = await fetch(path)
            const buf = await res.arrayBuffer()
            this.DB = new this.SQL.Database(new Uint8Array(buf))
        }
        return this.DB
    }
}
