window.addEventListener('DOMContentLoaded', async(event) => {
    document.getElementById('post-list').innerHTML = await new DbToHtml().toHtml()
});
