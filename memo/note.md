# つぶやきを保存するElectron版11

　初回時DBテーブルを作り`db/mylog.db`ファイルを出力するようにした。

<!-- more -->

# ブツ

* [リポジトリ][]

[リポジトリ]:https://github.com/ytyaru/Electron.MyLog.20220910101121

## インストール＆実行

```sh
NAME='Electron.MyLog.20220910101121'
git clone https://github.com/ytyaru/$NAME
cd $NAME
npm install
npm start
```

### 準備

1. [GitHubアカウントを作成する](https://github.com/join)
1. `repo`スコープ権限をもった[アクセストークンを作成する](https://github.com/settings/tokens)
1. [インストール＆実行](#install_run)してアプリ終了する
	1. `db/setting.json`ファイルが自動作成される
1. `db/setting.json`に以下をセットしファイル保存する
	1. `username`:任意のGitHubユーザ名
	1. `email`:任意のGitHubメールアドレス
	1. `token`:`repo`スコープ権限を持ったトークン
	1. `repo.name`:任意リポジトリ名
	1. `address`:任意モナコイン用アドレス
1. `dst/mytestrepo/.git`が存在しないことを確認する（あれば`dst`ごと削除する）
1. GitHub上に同名リモートリポジトリが存在しないことを確認する（あれば削除する）

### 実行

1. `npm start`で起動またはアプリで<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>R</kbd>キーを押す（リロードする）
1. `git init`コマンドが実行される
	* `repo/リポジトリ名`ディレクトリが作成され、その配下に`.git`ディレクトリが作成される
1. [createRepo][]実行後、リモートリポジトリが作成される

### GitHub Pages デプロイ

　アップロードされたファイルからサイトを作成する。

1. アップロードしたユーザのリポジトリページにアクセスする（`https://github.com/ユーザ名/リポジトリ名`）
1. 設定ページにアクセスする（`https://github.com/ユーザ名/リポジトリ名/settings`）
1. `Pages`ページにアクセスする（`https://github.com/ユーザ名/リポジトリ名/settings/pages`）
    1. `Source`のコンボボックスが`Deploy from a branch`になっていることを確認する
    1. `Branch`を`master`にし、ディレクトリを`/(root)`にし、<kbd>Save</kbd>ボタンを押す
    1. <kbd>F5</kbd>キーでリロードし、そのページに`https://ytyaru.github.io/リポジトリ名/`のリンクが表示されるまでくりかえす（***数分かかる***）
    1. `https://ytyaru.github.io/リポジトリ名/`のリンクを参照する（デプロイ完了してないと404エラー）

　すべて完了したリポジトリとそのサイトが以下。

* [作成DEMO][]
* [作成リポジトリ][]

[作成DEMO]:https://ytyaru.github.io/Electron.MyLog.20220908121018.Site/
[作成リポジトリ]:https://github.com/ytyaru/Electron.MyLog.20220908121018.Site

# やったこと

* 新規追加
    * 初回時DBテーブルを作り`db/mylog.db`ファイルを出力するようにした
* バグ修正
    * DBからつぶやきを取得するとき0件だとエラーになるの修正した
        * `main.js`
            * `ipcMain.handle('get', async(event) => {`
    * <kbd>削除</kbd>ボタン押下後、投げモナボタンが表示されないバグ修正
* リファクタリング
    * `main.js`
        * ipcMainではデフォルト引数が使えないので削除した
            * `ipcMain.handle('get', async(event) => {`
                * `await loadDb(path)`を削除した
                * 必ず`get()`より前に`loadDb()`を呼び出すようにする
    * `preload.js`
        * 不要コード削除
* 画面フォーカス
    * <kbd>つぶくやく</kbd>、<kbd>削除</kbd>が正常終了したらテキストエリアにフォーカスする

# 初回時DB作成

```javascript
async function loadDb(filePath) {
    if (null === filePath) { filePath = `src/db/mylog.db` }
    if (!lib.has(`DB`)) {
        const SQL = await initSqlJs().catch(e=>console.error(e))
        lib.set(`SQL`, SQL)
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
```

条件|ルート
----|------
DBファイル既存|`if`
DBファイルなし|`else`

　アプリ起動時、DBファイルがなければテーブルを作成し、DBファイルを作成する。

