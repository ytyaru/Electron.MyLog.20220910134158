class DbToHtml {
    constructor(loader=null) {
        this.now = new Date()
        this.loader = (loader) ? loader : new SqliteDbLoader()
    }
    async toHtml() {
        await this.loader.load()
        const cms = await this.loader.DB.exec(`select id,content,created from comments order by created desc;`)
        console.debug(cms)
        return cms[0].values.map(r=>this.toComment(r[0], r[1], r[2])).join('')
    }
    toComment(id, content, created) {
        return `<a id="id-${id}" class="anchor"></a><div class="mylog"><p>${this.br(this.autoLink(content))}</p><div class="mylog-meta">${this.#toTime(created)}<a href="#id-${id}">🔗</a>${this.#toMpurseButton()}</div></div>`
    }
    #toMpurseButton(address=null) { return `<mpurse-send-button></mpurse-send-button>` }
    #toTime(created, isFixedHtml=false) {
        const d = new Date(created * 1000)
        const u = d.toISOString()
        const l = (isFixedHtml) ? d.toLocaleString({ timeZone: 'Asia/Tokyo' }).replace(/\//g, '-') : this.#toElapsedTime(created)
        return `<time datetime="${u}" title="${u}">${l}</time>`
    }
    #toElapsedTime(created) { // 年、月、日が現在と同じなら省略する
        // 同じ日なら時間だけ表示
        // 同じ年なら月日だけ表示
        // それ以降なら年月日表示
        /*
        const d = new Date(created * 1000)
        console.debug(this.now.getTime() - created)
        console.debug(this.now.getYear()===d.getYear(), d.getMonth() < this.now.getMonth(), d.getDate() < this.now.getDate(), this.now.getMonth(), d.getMonth())
        console.debug(this.now.getYear(), d.getYear(), this.now.getMonth(), d.getMonth(), d.getDate(), this.now.getDate())
        if (d.getYear() < this.now.getYear()) { return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}` } // 一年間以上
        else if (this.now.getYear()===d.getYear() && d.getMonth() < this.now.getMonth() && d.getDate() < this.now.getDate()) {
            return `${(d.getMonth()+1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`
        }
        else { return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}` } // 同じ日
            */
        const d = new Date(created * 1000)
        const dates = Math.floor((this.now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
        if (365 < dates) {return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`} // 一年以上前
        else if (0 < dates) { // 一日以上
            return `${(d.getMonth()+1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`
        }
        else { return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}` } // 当日
    }
    #toDeleteCheckbox(id) { return `<label><input type="checkbox" name="delete" value="${id}">❌<label>` }

    //static toHtml(str) { return this.br(this.autoLink(str)) }
    br(str) { return str.replace(/\r\n|\n/g, '<br>') }
    //static autoLink(str) { return this.autoLinkIpfs(this.autoLinkHttps(str)) }
    autoLink(str) {
        let res = this.autoMedia(str); if (str !== res) { return res }
        return this.autoLinkIpfs(this.autoLinkHttps(str)) }
    autoLinkHttps(str) { // https://twitter.com/
        const regexp_url = /((h?)(ttps?:\/\/[a-zA-Z0-9.\-_@:/~?%&;=+#',()*!]+))/g; // ']))/;
        return str.replace(
            regexp_url, 
            (all, url, h, href)=>`<a href="h${href}">${url}</a>`
        );
    }
    autoLinkIpfs(str) { // ipfs://QmZZrDCuCV5A3WsxbbC6UCtrHtNs2eVyfJwF7JcJJoJGwV
        // https://hanzochang.com/articles/8
        // https://chrome.google.com/webstore/detail/ipfs-companion/nibjojkomfdiaoajekhjakgkdhaomnch
        // ipfs://QmZZrDCuCV5A3WsxbbC6UCtrHtNs2eVyfJwF7JcJJoJGwV
        // https://ipfs.io/ipfs/QmZZrDCuCV5A3WsxbbC6UCtrHtNs2eVyfJwF7JcJJoJGwV
        const regexp_url = /((ipfs?:\/\/[a-zA-Z0-9.\-_@:/~?%&;=+#',()*!]+))/g; // ']))/;
        return str.replace(
            regexp_url, 
            (all, url, h, href)=>`<a href="${url}">${url}</a>`
        );
    }
    autoMedia(str) {
        let res = this.autoImg(str); if (str !== res) { return res }
        res = this.autoVideo(str); if (str !== res) { return res }
        res = this.autoAudio(str); if (str !== res) { return res }
        return str
    }
    //static autoMedia(str) { return this.autoImg(this.autoVideo(this.autoAudio(str))) }
    autoImg(str) {
        const regexp_url = /((https?:\/\/[a-zA-Z0-9.\-_@:/~?%&;=+#',()*!]+\.(png|gif|jpg|jpeg|webp|avif)))/g; // ']))/;
        return str.replace(regexp_url, (all, url, href)=>`<img src="${href}">`)
    }
    /*
    static autoImg(str) {
        const regexp_url = /((https?:\/\/[a-zA-Z0-9.\-_@:/~?%&;=+#',()*!]+\.(png|gif|jpg|jpeg|webp|avif)))/g; // ']))/;
        if (str.match(regexp_url)) {
            const img = new Image()
            let attrs = ''
            // https://stackoverflow.com/questions/70767676/await-dispatchevent-how-to-listen-synchronously-to-a-dispatchevent-when-listene
            img.addEventListener('load', async(event) => {
                const width = event.target.naturalWidth
                const height = event.target.naturalHeight
                const threshold = 128
                let w = width
                let h = height
                while (w < threshold || h < threshold) {
                    w *= 2
                    h *= 2
                }
                // 128未満の場合ドット絵と判断し256以上になるよう整数倍する
                attrs=`width="${w}" height="${h}"` + (w===width&&h===height) ? '' || ' class="pixel-art"'
            })
            img.dispatchEvent(new Event('load'))
            return str.replace(regexp_url, (all, url, href)=>`<img src="${href}" ${attrs}>`)
        }
        return str
    }
    */
    autoVideo(str) {
        let res = this.autoVideoFile(str); if (str !== res) { return res }
        res = this.autoVideoYoutube(str); if (str !== res) { return res }
        return str
    }
    autoVideoFile(str) {
        const regexp_url = /((https?:\/\/[a-zA-Z0-9.\-_@:/~?%&;=+#',()*!]+\.(mp4|avi|wmv|mpg|flv|mov|webm|mkv|asf)))/g; // ']))/;
        return str.replace(regexp_url, (all, url, href)=>`<video controls width="320" src="${url}"></video>`)
    }
    autoVideoYoutube(str) { // https://www.youtube.com/watch?
        const regexp_url = /https:\/\/www.youtube.com\/watch\?v=([a-zA-Z0-9.\-_@:/~?%&;=+#',()*!]+)/
        const match = str.match(regexp_url)
        if (match && 1 < match.length) {
            return `<iframe width="320" height="240" src="https://www.youtube.com/embed/${match[1]}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
        }
        return str
    }
    autoAudio(str) {
        const regexp_url = /((https?:\/\/[a-zA-Z0-9.\-_@:/~?%&;=+#',()*!]+\.(wav|mp3|ogg|flac|wma|aiff|aac|m4a)))/g; // ']))/;
        return str.replace(regexp_url, (all, url, href)=>`<audio controls width="320" src="${url}"></audio>`)
    }
}
