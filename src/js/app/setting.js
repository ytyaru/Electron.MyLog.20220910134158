class Setting {
    static PATH = `src/db/setting.json`
    static async load() {
        const isExist = await window.myApi.exists(this.PATH)
        if (!isExist) {
            const username = await window.myApi.shell(`git config --global user.name`)
            const email = await window.myApi.shell(`git config --global user.email`)
            await window.myApi.writeFile(this.PATH, JSON.stringify(
                {mona:{address:""},github:{username:username.stdout.trim(),email:email.stdout.trim(),token:"",repo:{name:await this.#defaultRepoName(),description:"著者のつぶやきサイトです。",homepage:"",topics:["website"],}}}
        )) }
        return JSON.parse(await window.myApi.readTextFile(this.PATH))
    }
    static async #defaultRepoName() {
        let rootName = await window.myApi.rootDirName() // main.jsが存在するディレクトリパス
        rootName = await window.myApi.dirname(rootName) // js削除
        rootName = await window.myApi.dirname(rootName) // src削除
        return await window.myApi.basename(rootName) +`.Site` // ディレクトリ名のみ抽出
    }
    static async save(obj) { return await window.myApi.writeFile(this.PATH, JSON.stringify(obj)) }
    static async obj(address, username, email, token, name) {
        const json = await this.load()
        json.mona.address = address
        json.github.username = username
        json.github.email = email
        json.github.token = token
        json.github.repo.name = name
        return json
    }
}
