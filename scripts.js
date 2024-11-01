async function shortenUrl() {
    const urlInput = document.getElementById('url-input').value;
    const resultDiv = document.getElementById('result');
    
    if (!urlInput) {
        resultDiv.innerHTML = "Please enter a URL.";
        return;
    }

    try {
        const response = await fetch(`/create?url=${encodeURIComponent(urlInput)}`, {
            method: 'POST',
        });

        if (!response.ok) throw new Error("Failed to shorten URL.");

        const shortenedID = await response.text();
        resultDiv.innerHTML = `Shortened URL: <a href="/short/${shortenedID}" target="_blank">http://localhost:3000/short/${shortenedID}</a>`;
    } catch (error) {
        resultDiv.innerHTML = "Error: " + error.message;
    }
}
