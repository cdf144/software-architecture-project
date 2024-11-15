import React, { useState } from "react";

function ShortenUrl() {
  const [url, setUrl] = useState("");

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    if (!url) {
      alert("Please enter a URL");
      return;
    }

    const encodedUrl = encodeURIComponent(
      (document.getElementById("url") as HTMLInputElement).value,
    );

    fetch(
      "http://localhost:3000/create?" +
        new URLSearchParams({ url: encodedUrl }).toString(),
      {
        method: "POST",
      },
    )
      .then((res) => res.json())
      .then((data) => {
        (document.getElementById("shortened") as HTMLInputElement).value =
          data.shortened_url;
      })
      .catch((err) => console.error(err));

    setUrl("");
  };

  return (
    <div>
      <main>
        <section>
          <h1 className="mb-5">URL Shortener</h1>
          <form className="w-50" onSubmit={onSubmit}>
            <input
              id="url"
              className="w-100 border border-primary p-2 mb-2 fs-3 h-25"
              type="text"
              placeholder="http://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <div className="d-grid gap-2 col-6 mx-auto">
              <button type="submit" className="btn btn-danger m-5">
                Shorten!
              </button>
            </div>
          </form>
        </section>

        <section>
          <input
            id="shortened"
            className="w-50 border border-primary p-2 mb-2 fs-3 h-25"
            type="text"
            placeholder="Shortened URL"
            readOnly
          />
        </section>
      </main>
    </div>
  );
}

export default ShortenUrl;
