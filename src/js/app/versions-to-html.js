class VersionsToHtml {
    static async toHtml() {
        const vers = await window.myApi.versions()
        return `<table><tr><th>tools</th><th>version</th></tr>` + Object.entries(vers).map(e=>`<tr><td>${e[0]}</td><td>${e[1]}</td></tr>`).join('') + `</table>`
    }
}
