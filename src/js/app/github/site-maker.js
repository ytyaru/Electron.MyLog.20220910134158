class SiteMaker { // GitHub Pages で稼働するようファイル作成する（git push するファイルを作る）
    constructor(setting) {
        this.setting = setting
    }
    async make(setting) { // 初回にリモートリポジトリを作成するとき一緒に作成する
        console.log('----- make() start -----')
        if (setting) { this.setting = setting }
        await Promise.all([
            //this.#cp(`lib/`),
            //this.#cp(`js/util/`),
            //this.#cp(`src/js/sns/`),
            //this.#cp(`js/sns/sns/`),
            //this.#cp(`js/sns/webmention/`),
            this.#cp(`css/`),
            this.#cp(`asset/`),
            this.#cp(`db/mylog.db`),
            window.myApi.cp(`LICENSE.txt`, `dst/${this.setting.github.repo.name}/LICENSE.txt`, {'recursive':true, 'preserveTimestamps':true}),
            this.#readMeCode(),
            this.#indexCode(),
            //window.myApi.cp(`src/js/app/github/export/index.html`, `dst/${this.setting.github.repo.name}/index.html`, {'recursive':true, 'preserveTimestamps':true}),
            window.myApi.cp(`src/js/app/github/export/style.css`, `dst/${this.setting.github.repo.name}/css/style.css`, {'recursive':true, 'preserveTimestamps':true}),
            window.myApi.cp(`src/js/app/github/export/main.js`, `dst/${this.setting.github.repo.name}/js/main.js`, {'recursive':true, 'preserveTimestamps':true}),
            window.myApi.cp(`src/lib/sql.js/1.7.0/sql-wasm.min.js`, `dst/${this.setting.github.repo.name}/lib/sql.js/1.7.0/sql-wasm.min.js`, {'recursive':true, 'preserveTimestamps':true}),
            window.myApi.cp(`src/lib/sql.js/1.7.0/sql-wasm.wasm`, `dst/${this.setting.github.repo.name}/lib/sql.js/1.7.0/sql-wasm.wasm`, {'recursive':true, 'preserveTimestamps':true}),
            window.myApi.cp(`src/lib/toastify/1.11.2/min.css`, `dst/${this.setting.github.repo.name}/lib/toastify/1.11.2/min.css`, {'recursive':true, 'preserveTimestamps':true}),
            window.myApi.cp(`src/lib/toastify/1.11.2/min.js`, `dst/${this.setting.github.repo.name}/lib/toastify/1.11.2/min.js`, {'recursive':true, 'preserveTimestamps':true}),
            //this.#sqliteDbLoaderCode()
            window.myApi.cp(`src/js/app/github/export/sqlite-db-loader.js`, `dst/${this.setting.github.repo.name}/lib/mylog/sqlite-db-loader.js`, {'recursive':true, 'preserveTimestamps':true}),
            window.myApi.cp(`src/js/app/github/export/db-to-html.js`, `dst/${this.setting.github.repo.name}/lib/mylog/db-to-html.js`, {'recursive':true, 'preserveTimestamps':true}),
            window.myApi.cp(`src/js/app/github/export/run_server.py`, `dst/${this.setting.github.repo.name}/run_server.py`, {'recursive':true, 'preserveTimestamps':true}),
            window.myApi.cp(`src/js/app/github/export/server.sh`, `dst/${this.setting.github.repo.name}/server.sh`, {'recursive':true, 'preserveTimestamps':true}),
            window.myApi.cp(`src/js/app/github/export/.gitignore`, `dst/${this.setting.github.repo.name}/.gitignore`, {'recursive':true, 'preserveTimestamps':true}),
            this.#mpurseSendButtonCode(),
            //window.myApi.cp(`src/js/sns/monacoin/mpurse-send-button.js`, `dst/${this.setting.github.repo.name}/lib/monacoin/mpurse-send-button.js`, {'recursive':true, 'preserveTimestamps':true})
            window.myApi.cp(`src/lib/party/party.min.js`, `dst/${this.setting.github.repo.name}/lib/party/party.min.js`, {'recursive':true, 'preserveTimestamps':true}),
            window.myApi.cp(`src/js/util/party-sparkle-hart.js`, `dst/${this.setting.github.repo.name}/lib/monacoin/party-sparkle-image.js`, {'recursive':true, 'preserveTimestamps':true}),
            window.myApi.cp(`src/js/util/party-sparkle-image.js`, `dst/${this.setting.github.repo.name}/lib/monacoin/party-sparkle-hart.js`, {'recursive':true, 'preserveTimestamps':true}),
        ])
        console.log('----- make() end -----')
    }
    async #cp(path) {
        const src = `src/${path}`
        const dst= `dst/${this.setting.github.repo.name}/${path}`
        const exists = await window.myApi.exists(src)
        if (!exists) { console.log(`Not exists. ${src}`); return; }
        // ファイルまたはディレクトリが存在しなければエラーになるので事前にexists判定する
        await window.myApi.cp(src, dst, {'recursive':true, 'preserveTimestamps':true})
    }
    async #mpurseSendButtonCode() { // デフォルトのアドレスを指定値に変更したファイルを作成・上書きする
        const file = `mpurse-send-button.js`
        const srcDir = `src/js/sns/monacoin/`
        const dstDir = `dst/${this.setting.github.repo.name}/lib/monacoin/`
        await window.myApi.mkdir(dstDir) // ファイル作成前にディレクトリなくばエラーになる
        let code = await window.myApi.readTextFile(`${srcDir}/${file}`)
        console.debug(this.setting.mona.address)
        code = code.replace(/MEHCqJbgiNERCH3bRAtNSSD9uxPViEX1nu/g, this.setting.mona.address)
        code = code.replace(/\'\.\/src\/asset\/image\/monacoin\/\'/g, `'./asset/image/monacoin/'`)
        console.debug(code)
        // なぜか事前にawait this.#cp(`src/js/sns/`),しコピーファイルがあると上書きされない
        await window.myApi.writeFile(`${dstDir}/${file}`, code)
    }
    async #readMeCode() {
        const file = `README.md`
        const srcDir = `src/js/app/github/export/`
        const dstDir = `dst/${this.setting.github.repo.name}/`
        let code = await window.myApi.readTextFile(`${srcDir}/${file}`)
        code = code.replace(/{{ProjectName}}/g, this.setting.github.repo.name)
        code = code.replace(/{{Description}}/g, this.setting.github.repo.description)
        code = code.replace(/{{SiteUrl}}/g, this.setting.github.repo.homepage)
        code = code.replace(/{{MakeToolUrl}}/g, 'https://github.com/ytyaru/Electron.MyLog.git.push.await.20220907103921')
        console.debug(code)
        await window.myApi.mkdir(dstDir)
        await window.myApi.writeFile(`${dstDir}/${file}`, code)
    }
    async #indexCode() { // GitHubリポジトリ名をURLにぶちこむ
        const file = `index.html`
        const srcDir = `src/js/app/github/export/`
        const dstDir = `dst/${this.setting.github.repo.name}/`
        await window.myApi.mkdir(dstDir) // ファイル作成前にディレクトリなくばエラーになる
        let code = await window.myApi.readTextFile(`${srcDir}/${file}`)
        code = code.replace(/{{username}}/g, this.setting.github.username)
        code = code.replace(/{{repo}}/g, this.setting.github.repo.name)
        code = code.replace(/{{year}}/g, new Date().getFullYear()) // 初回のみアップするから現時刻でよい
        console.debug(code)
        await window.myApi.writeFile(`${dstDir}/${file}`, code)
    }
    async #sqliteDbLoaderCode() {
        const file = `sqlite-db-loader.js`
        const srcDir = `src/js/app/github/export/`
        const dstDir = `dst/${this.setting.github.repo.name}/lib/mylog/`
        await window.myApi.mkdir(dstDir) // ファイル作成前にディレクトリなくばエラーになる
        let code = await window.myApi.readTextFile(`${srcDir}/${file}`)
        code = code.replace(/mytestrepo/g, this.setting.github.repo.name)
        console.debug(code)
        await window.myApi.writeFile(`${dstDir}/${file}`, code)
    }
}
