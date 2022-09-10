class Git {
    constructor(setting) {
        this.setting = setting
        this.dir = `dst`
        this.remote = `origin`
        this.branch = `master`
    }
    async init(setting=null) {
        console.log('Git.init()')
        if (setting) { this.setting = setting }
        console.log(this.setting)
        const exists = await window.myApi.exists(`${this.dir}/${this.setting.github.repo.name}/.git`)
        if (exists) {
            console.log(`${this.dir}/${this.setting.github.repo.name}/.git は既存のためgit initしません。`)
            return exists
        }
        console.log(exists)
        this.#valid(`git initできません！`)
        await window.myApi.mkdir(`${this.dir}/${this.setting.github.repo.name}`)
        let res = await window.myApi.shell(`cd "${this.dir}/${this.setting.github.repo.name}/"; git init;`)
        console.log(res.stdout)
        console.log(`ローカルリポジトリを作成しました。`)
        res = await this.#remoteAddOrigin()
        console.log(res.stdout)
        return exists
    }
    #valid(msg=null, token=false) {
        if (msg) { msg += '\n' }
        if (!this.setting.github.username) { throw new Error(`${msg}db/setting.jsonファイルにGitHubユーザ名をセットしてください`) }
        if (!this.setting.github.email) { throw new Error(`${msg}db/setting.jsonファイルにGitHubメールアドレスをセットしてください`) }
        if (token && !this.setting.github.token) { throw new Error(`${msg}db/setting.jsonファイルにGitHubアクセストークンをセットしてください\nrepoスコープ権限をもっている必要があります`) }
        if (!this.setting.github.repo.name) { throw new Error(`${msg}db/setting.jsonファイルにGitHubリポジトリ名をセットしてください\n100字以内で英数字・記号は._-の3つのみ使用可`) }
    }
    async push(message=null, setting=null) {
        if (setting) { this.setting = setting }
        console.log(this.setting)
        this.#valid(`git pushできません！`, true)
        if (!message) { message = `追記:${new Date().toISOString()}` }
        let res = await this.#setUser()
        console.log(res.stdout)
        res = await this.#add()
        console.log(res.stdout)
        res = await this.#commit(message)
        console.log(res.stdout)
        res = await this.#push()
        console.log(res.stdout)
    }
    // これやらないとcommit時以下エラーになる
    // Uncaught (in promise) Error: Error invoking remote method 'shell': Error: Command failed: git push origin master
    // fatal: not a git repository (or any parent up to mount point /)
    // Stopping at filesystem boundary (GIT_DISCOVERY_ACROSS_FILESYSTEM not set).
    async #setUser(level='local') { // local, global, system
        console.log('setUser():', this.setting.github.username, this.setting.github.email, level)
        if (!['local', 'global', 'system'].includes(level)) { alert(`db/setting.jsonファイルにGitHubユーザ名をセットしてください`, true); return false; }
        const res1 = await window.myApi.shell(`cd "${this.dir}/${this.setting.github.repo.name}/"; git config --${level} user.name '${this.setting.github.username}';`)
        const res2 = await window.myApi.shell(`cd "${this.dir}/${this.setting.github.repo.name}/"; git config --${level} user.email '${this.setting.github.email}';`)
        return res1.stdout + '\n' + res2.stdout
    }
    async #add() {
        return await window.myApi.shell(`cd "${this.dir}/${this.setting.github.repo.name}"; git add .;`)
    }
    async #addList() {
        return await window.myApi.shell(`cd "${this.dir}/${this.setting.github.repo.name}"; git add -n .;`)
    }
    async #commit(message) {
        return await window.myApi.shell(`cd "${this.dir}/${this.setting.github.repo.name}"; git commit -m '${message}';`)
    }
    async #remoteAddOrigin() {
        return await window.myApi.shell(`cd "${this.dir}/${this.setting.github.repo.name}"; git remote add ${this.remote} "https://${this.setting.github.username}:${this.setting.github.token}@github.com/${this.setting.github.username}/${this.setting.github.repo.name}.git";`)
    }
    async #remoteSetUrlOrigin() {
        return await window.myApi.shell(`cd "${this.dir}/${this.setting.github.repo.name}"; git remote set-url ${this.remote} "https://${this.setting.github.username}:${this.setting.github.token}@github.com/${this.setting.github.username}/${this.setting.github.repo.name}.git";`)
    }
    async #push() {
        return await window.myApi.shell(`cd "${this.dir}/${this.setting.github.repo.name}"; git push ${this.remote} ${this.branch}`)
    }
}
