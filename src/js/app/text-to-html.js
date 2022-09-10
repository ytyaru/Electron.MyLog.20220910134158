class TextToHtml {
    static now = new Date()
    static toHtml(id, content, created, address=null, isFixedHtml=false) {
        console.log(address)
        return `<a id="id-${id}" class="anchor"></a><div class="mylog"><p>${this.br(this.autoLink(content))}</p><div class="mylog-meta">${this.toTime(created, isFixedHtml)}${(isFixedHtml) ? '' : this.#toDeleteCheckbox(id)}<a href="#id-${id}">🔗</a>${this.#toMpurseButton(address)}</div></div>`
    }
    static toBody(id, created, address=null, isFixedHtml=false) { return `<a id="id-${id}" class="anchor"></a><div class="mylog"><p></p><div class="mylog-meta">${this.toTime(created, isFixedHtml)}${(isFixedHtml) ? '' : this.#toDeleteCheckbox(id)}<a href="#id-${id}">🔗</a>${this.#toMpurseButton(address)}</div></div>` }
    static toText(content) { return this.br(this.autoLink(content)) }
    static #toMpurseButton(address=null) {
        return (address) ? `<mpurse-send-button to="${address}"></mpurse-send-button>` : ''
    }
    static toTime(created, isFixedHtml=false) {
        const d = new Date(created * 1000)
        const u = d.toISOString()
        //const l = d.toLocaleString({ timeZone: 'Asia/Tokyo' }).replace(/\//g, '-')
        const l = (isFixedHtml) ? d.toLocaleString({ timeZone: 'Asia/Tokyo' }).replace(/\//g, '-') : this.#toElapsedTime(created)
        return `<time datetime="${u}" title="${u}">${l}</time>`
    }
    static #toElapsedTime(created) { // 年、月、日が現在と同じなら省略する
        const d = new Date(created * 1000)
        const dates = Math.floor((this.now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
        if (365 < dates) {return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`} // 一年以上前
        else if (0 < dates) { // 一日以上
            return `${(d.getMonth()+1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`
        }
        else { return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}` } // 当日
    }
    static #toDeleteCheckbox(id) { return `<label><input type="checkbox" name="delete" value="${id}">❌</label>` }

    static br(str) { return str.replace(/\r\n|\n/g, '<br>') }
    static autoLink(str) {
        let res = this.autoMedia(str); if (str !== res) { return res }
        return this.autoLinkIpfs(this.autoLinkHttps(str)) }
    static autoLinkHttps(str) { // https://twitter.com/
        const regexp_url = /((h?)(ttps?:\/\/[a-zA-Z0-9.\-_@:/~?%&;=+#',()*!]+))/g; // ']))/;
        return str.replace(
            regexp_url, 
            (all, url, h, href)=>`<a href="h${href}">${url}</a>`
        );
    }
    static autoLinkIpfs(str) { // ipfs://QmZZrDCuCV5A3WsxbbC6UCtrHtNs2eVyfJwF7JcJJoJGwV
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
    static autoMedia(str) {
        let res = this.autoImg(str); if (str !== res) { return res }
        res = this.autoVideo(str); if (str !== res) { return res }
        res = this.autoAudio(str); if (str !== res) { return res }
        return str
    }
    static autoImg(str) {
        const regexp_url = /((https?:\/\/[a-zA-Z0-9.\-_@:/~?%&;=+#',()*!]+\.(png|gif|jpg|jpeg|webp|avif)))/g; // ']))/;
        return str.replace(regexp_url, (all, url, href)=>`<img src="${href}">`)
    }
    static autoVideo(str) {
        let res = this.autoVideoFile(str); if (str !== res) { return res }
        res = this.autoVideoYoutube(str); if (str !== res) { return res }
        return str
    }
    static autoVideoFile(str) {
        const regexp_url = /((https?:\/\/[a-zA-Z0-9.\-_@:/~?%&;=+#',()*!]+\.(mp4|avi|wmv|mpg|flv|mov|webm|mkv|asf)))/g; // ']))/;
        return str.replace(regexp_url, (all, url, href)=>`<video controls width="320" src="${url}"></video>`)
    }
    static autoVideoYoutube(str) { // https://www.youtube.com/watch?
        const regexp_url = /https:\/\/www.youtube.com\/watch\?v=([a-zA-Z0-9.\-_@:/~?%&;=+#',()*!]+)/
        const match = str.match(regexp_url)
        if (match && 1 < match.length) {
            return `<iframe width="320" height="240" src="https://www.youtube.com/embed/${match[1]}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
        }
        return str
    }
    static autoAudio(str) {
        const regexp_url = /((https?:\/\/[a-zA-Z0-9.\-_@:/~?%&;=+#',()*!]+\.(wav|mp3|ogg|flac|wma|aiff|aac|m4a)))/g; // ']))/;
        return str.replace(regexp_url, (all, url, href)=>`<audio controls width="320" src="${url}"></audio>`)
    }
}
