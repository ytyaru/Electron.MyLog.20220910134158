class GitHub {
    constructor(setting) {
        this.setting = setting
        this.branch = `master`
    }
    async createRepo(params, setting) { // https://docs.github.com/ja/rest/repos/repos#create-a-repository-for-the-authenticated-user
        this.setting = setting
        console.log('GitHub.createRepo()')
        console.log(params)
        console.log(this.setting)
        if (!params.hasOwnProperty('name')) {
            console.error(`引数paramsのプロパティにnameは必須です。`)
            return false
        }
        if (!this.#validRepoName(params.name)) {
            console.error(`引数params.nameの値が不正値です。英数字._-100字以内にしてください。`)
            return false
        }
        if (!this.setting?.github?.repo?.description) {
            this.setting.github.repo.description = `著者のつぶやきサイトです。`
        }
        if (!this.setting?.github?.repo?.homepage) {
            this.setting.github.repo.homepage = `https://${this.setting.github.username}.github.io/${this.setting.github.repo.name}/`
        }
        if (!params?.description) {
            params.description = this.setting.github.repo.description
        }
        if (!params?.homepage) {
            params.homepage = `https://${this.setting.github.username}.github.io/${params.name}/`
        }
        console.log(params)
        try {
            const url = `https://api.github.com/user/repos`
            const options = {
                'method': 'POST',
                'headers': {
                    'Authorization': `token ${this.setting.github.token}`,
                    'User-Agent': `${this.setting.github.username}`,
                    'Content-Type': 'application/json',
                },
                'body': JSON.stringify(params),
            }
            console.log(url)
            console.log(options)
            const res = await window.myApi.fetch(url, options);
            console.log(res)
            console.log(`リモートリポジトリを作成しました。`)
            return res
        } catch (e) {
            console.error(e)
            console.error(`リモートリポジトリ作成でエラーになりました……`)
        }
    }
    #validRepoName(name) { return name.match(/[a-zA-Z0-9\._\-]{1,100}/g) }
}
