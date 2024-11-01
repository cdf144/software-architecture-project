async function shortenUrl() {
    const urlInput = document.getElementById('url-input').value;
    const resultDiv = document.getElementById('result');
    
    if (!urlInput) {
        resultDiv.innerHTML = "Please enter a URL.";
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/create?url=${encodeURIComponent(urlInput)}`, {
            method: 'POST',
        });

        if (!response.ok) throw new Error("Failed to shorten URL.");

        const shortenedID = await response.json();
        resultDiv.innerHTML = `Shortened URL: <a href="${shortenedID.original_url}" target="_blank">${shortenedID.shortened_url}</a>`;
    } catch (error) {
        resultDiv.innerHTML = "Error: " + error.message;
    }
}
