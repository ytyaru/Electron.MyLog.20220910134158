class MyLogDb {
    constructor() {
        this.now = new Date()
        this.LENGTH = 140
        this.LINE = 15
        this.path = 'src/db/mylog.db'
    }
    async clear() { await window.myApi.clear() }
    async delete(ids) {
        console.debug(ids)
        const isAll = (0===ids.length)
        const msg = ((isAll) ? `つぶやきをすべて削除します。` : `選択したつぶやきを削除します。`) + `\n本当によろしいですか？`
        if (confirm(msg)) {
            console.debug('削除します。')
            if (isAll) { console.debug('全件削除します。'); await window.myApi.clear() }
            else { console.debug('選択削除します。'); await window.myApi.delete(ids) }
            await window.myApi.writeFile(this.path, await window.myApi.exportDb());
            return true
        } else { return false }
    }
    async insert(content, address=null) {
        if (!content) { throw new Error('つぶやく内容をテキストエリアに入力してください。') }
        if (this.LENGTH < content.length) { throw new Error(`つぶやく内容は${this.LENGTH}字以内にしてください。`) }
        const match = content.match(/\r\n|\n/g)
        if (match && this.LINE <= match.length) { throw new Error(`つぶやく内容は${this.LINE}行以内にしてください。`) }
        const now = Math.floor(new Date().getTime() / 1000)
        const r = await window.myApi.insert({content:content, created:now});
        console.log(r)
        await window.myApi.writeFile(this.path, await window.myApi.exportDb());
        return TextToHtml.toHtml(r[0], r[1], r[2], address) // id, content, created
    }
    #insertHtml(id, content, created) { return `<p>${this.#toContent(content)}<br>${this.#toTime(created)}${this.#toDeleteCheckbox(id)}</p>` }
    async toHtml(address=null) {
        const cms = await window.myApi.get()
        return cms.map(c=>TextToHtml.toHtml(c[0], c[1], c[2], address)).join('')
    }
    #toTime(created) {
        const d = new Date(created * 1000)
        const u = d.toISOString()
        //const l = d.toLocaleString({ timeZone: 'Asia/Tokyo' }).replace(/\//g, '-')
        const l = this.#toElapsedTime(created)
        return `<time datetime="${u}" title="${u}">${l}</time>`
    }
    #toElapsedTime(created) { // `yyyy-MM-dd`, `MM-dd`, `HH:mm`
        const d = new Date(created * 1000)
        console.debug(this.now.getTime() - created)
        console.debug(this.now.getYear()===d.getYear(), this.now.getMonth()===d.getMonth(), d.getDate() < this.now.getDate())
        console.debug(this.now.getYear(), d.getYear(), this.now.getMonth(), d.getMonth(), d.getDate(), this.now.getDate())
        if (d.getYear() < this.now.getYear()) { return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}` } // 一年間以上
        else if (this.now.getYear()===d.getYear() && this.now.getMonth()===d.getMonth() && d.getDate() < this.now.getDate()) {
            return `${(d.getMonth()+1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`
        }
        else { return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}` } // 同じ日
    }
    #toContent(content) { return TextToHtml.toHtml(content) } 
    #toDeleteCheckbox(id) { return `<label><input type="checkbox" name="delete" value="${id}">❌<label>` }
}
