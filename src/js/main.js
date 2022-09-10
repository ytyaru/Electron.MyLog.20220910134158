const { app, BrowserWindow, ipcMain, dialog, net } = require('electron')
const path = require('path')
const fs = require('fs') // cp, copyFileSync
const initSqlJs = require('sql.js');
const util = require('util')
const childProcess = require('child_process');
const fetch = require('electron-fetch').default; // Node.js v18 ならGlobalにfetchがあるらしい
const lib = new Map()

function createWindow () {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        //transparent: true, // 透過
        //opacity: 0.3,
        //frame: false,      // フレームを非表示にする
        webPreferences: {
            nodeIntegration: false,
            //nodeIntegration: true, // https://www.electronjs.org/ja/docs/latest/breaking-changes
            enableRemoteModule: true,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    })
    mainWindow.loadFile('index.html')
    //mainWindow.setMenuBarVisibility(false);
    mainWindow.webContents.openDevTools()
}

app.whenReady().then(() => {
    createWindow()
    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

async function loadDb(filePath) {
    if (null === filePath) { filePath = `src/db/mylog.db` }
    if (!lib.has(`DB`)) {
        const SQL = await initSqlJs().catch(e=>console.error(e))
        lib.set(`SQL`, SQL)
        //const db = new SQL.Database(new Uint8Array(fs.readFileSync(filePath)))
        //const db = (fs.existsSync(filePath)) ? new SQL.Database(new Uint8Array(fs.readFileSync(filePath))) : new SQL.Database()
        if (fs.existsSync(filePath)) {
            console.log('----- loadDb() if')
            const db = new SQL.Database(new Uint8Array(fs.readFileSync(filePath)))
            lib.set(`DB`, db)
        } else {
            console.log('----- loadDb() else')
            const db = new SQL.Database()
            lib.set(`DB`, db)
            createTable()
            fs.writeFileSync(filePath, lib.get(`DB`).export())
        }
    }
    return lib.get(`DB`)
}
async function createTable() {
    const sql = `create table if not exists comments (
  id integer primary key not null,
  content text not null,
  created integer not null
);`
    const res = lib.get(`DB`).exec(sql)
    console.log(res)
}
function readFile(path, kwargs) { return fs.readFileSync(path, kwargs) }

/*
ipcMain.handle('createTableSql', async(event, filePath) => {
    const res = lib.get(`DB`).exec(`select sql from sqlite_master where type='table';`)
    return (0 === res.length) ? res : res[0].values
})
ipcMain.handle('tableNames', async(event, filePath) => {
    const res = lib.get(`DB`).exec(`select name from sqlite_master where type='table';`)
    return (0 === res.length) ? res : res[0].values
})
*/

// ここではdb.execを参照できるが、return後では参照できない謎
ipcMain.handle('loadDb', async(event, filePath) => {
    console.log('----- loadDb ----- ', filePath)
    return loadDb(filePath)
})
ipcMain.handle('createTable', async(event) => {
    const sql = `create table if not exists comments (
  id integer primary key not null,
  content text not null,
  created integer not null
);`
    const res = lib.get(`DB`).exec(sql)
    console.log(res)
})
// db.execの実行結果を返すならOK
ipcMain.handle('get', async(event) => {
    console.log('----- get ----- ')
    if (true) {
        const res = lib.get(`DB`).exec(`select name from sqlite_master where type='table';`)
        const a = (0 === res.length) ? res : res[0].values
        console.log('tablename', a)
    }
    const res = lib.get(`DB`).exec(`select * from comments order by created desc;`)
    console.log(res)
    return (0 === res.length) ? res : res[0].values
})
ipcMain.handle('insert', async(event, r)=>{
    if (!lib.has(`SQL`)) {loadDb()}
    console.debug(r)
    lib.get(`DB`).exec(`insert into comments(content, created) values('${r.content}', ${r.created});`)
    const res = lib.get(`DB`).exec(`select * from comments where created = ${r.created};`)
    return res[0].values[0]
})
ipcMain.handle('clear', async(event)=>{
    lib.get(`DB`).exec(`delete from comments;`)
})
ipcMain.handle('delete', async(event, ids)=>{
    lib.get(`DB`).exec(`begin;`)
    for (const id of ids) {
        lib.get(`DB`).exec(`delete from comments where id = ${id};`)
    }
    lib.get(`DB`).exec(`commit;`)
})
ipcMain.handle('exportDb', async(event)=>{
    return lib.get(`DB`).export()
})

ipcMain.handle('versions', (event)=>{ return process.versions })
ipcMain.handle('rootDirName', (event)=>{ return __dirname })

ipcMain.handle('basename', (event, p)=>{ return path.basename(p) })
ipcMain.handle('dirname', (event, p)=>{ return path.dirname(p) })
ipcMain.handle('extname', (event, p)=>{ return path.extname(p) })
ipcMain.handle('pathSep', (event, p)=>{ return path.sep })

ipcMain.handle('exists', (event, path)=>{ return fs.existsSync(path) })
ipcMain.handle('isFile', (event, path)=>{ return fs.lstatSync(path).isFile() })
ipcMain.handle('isDir', (event, path)=>{ return fs.lstatSync(path).isDirectory() })
ipcMain.handle('isLink', (event, path)=>{ return fs.lstatSync(path).isSymbolicLink() })
ipcMain.handle('isBlockDev', (event, path)=>{ return fs.lstatSync(path).isBlockDevice() })
ipcMain.handle('isCharDev', (event, path)=>{ return fs.lstatSync(path).isCharacterDevice() })
ipcMain.handle('isFifo', (event, path)=>{ return fs.lstatSync(path).isFIFO() })
ipcMain.handle('isSocket', (event, path)=>{ return fs.lstatSync(path).isSocket() })
ipcMain.handle('mkdir', (event, path)=>{
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path, {recursive:true})
    }
})
ipcMain.handle('cp', async(event, src, dst, options) => { // Node.js v16.7.0〜 https://nodejs.org/api/fs.html#fscpsrc-dest-options-callback
    fs.cp(src, dst, options, ()=>{})
})
ipcMain.handle('readFile', (event, path, kwargs)=>{ return readFile(path, kwargs) })
ipcMain.handle('readTextFile', (event, path, encoding='utf8')=>{ return readFile(path, { encoding: encoding }) })
ipcMain.handle('writeFile', (event, path, data)=>{ return fs.writeFileSync(path, data) })
ipcMain.handle('shell', async(event, command) => {
    const exec = util.promisify(childProcess.exec);
    return await exec(command);
    //let result = await exec(command);
    //document.getElementById('result').value = result.stdout;
})
ipcMain.handle('fetch', async(event, url, options)=>{
    console.log('----- fetch -----')
    console.log(url)
    console.log(options)
    const res = await fetch(url, options).catch(e=>console.error(e));
    console.log(res)
    const json = await res.json()
    console.log(json)
    return json
})

