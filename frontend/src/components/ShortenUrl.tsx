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

    fetch(
      "http://localhost:3000/create?" +
        new URLSearchParams({ url: url }).toString(),
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
    <div className="w-fit p-6 rounded-xl shadow-xl bg-zinc-600/20">
      <h1 className="mx-auto my-4 text-center text-3xl font-bold">
        URL Shortener
      </h1>

      <form className="mx-auto my-8 max-w-3xl flex gap-x-2" onSubmit={onSubmit}>
        <input
          id="url"
          className="w-screen h-12 m-4 p-4 rounded-lg border border-gray-400/20 outline-none hover:border-[#646cff]/65 hover:shadow-sm focus:border-[#646cff] transition duration-300 font-medium"
          type="text"
          placeholder="Input URL here. Ex: https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <div className="w-fit mx-auto">
          <button type="submit" className="h-12 m-4">
            Shorten!
          </button>
        </div>
      </form>

      <div className="mx-auto my-4 max-w-3xl flex justify-items-center">
        <input
          id="shortened"
          className="mx-4 my-auto w-full h-12 p-4 rounded-lg border border-gray-400/20 outline-none hover:border-[#646cff]/65 hover:shadow-sm focus:border-[#646cff] transition duration-300 font-medium"
          type="text"
          placeholder="Shortened URL"
          readOnly
        />
      </div>
    </div>
  );
}

export default ShortenUrl;
