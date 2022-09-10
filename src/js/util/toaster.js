class Toaster {
    static toast(message, error=false) {
        if (error) { console.error(message) }
        else { console.log(message) }
        const options = {
            text: message, 
            position:'center'
        }
        if (error) { options.style = { background: "red" } }
        if (Toastify) { Toastify(options).showToast(); }
        else { alert(message) }
    }
}
