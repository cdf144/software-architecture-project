import React, { useState } from "react";
import { CircuitBreaker, CircuitState } from "../utils/CircuitBreaker";
import "./custom.css";

interface ShortenUrlResponse {
  id: string;
  original_url: string;
  shortened_url: string;
}

const circuitBreaker = new CircuitBreaker(3, 2, 15 * 1000, 60 * 1000);

function ShortenUrl() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [circuitState, setCircuitState] = useState(CircuitState.CLOSED);

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    if (loading) {
      return;
    }
    if (!url) {
      alert("Please enter a URL");
      return;
    }

    let normalizedUrl = url.trim();
    try {
      // Normalize the URL by adding http:// if missing
      if (!/^https?:\/\//i.test(normalizedUrl)) {
        normalizedUrl = `http://${normalizedUrl}`;
      }

      // Validate the URL
      new URL(normalizedUrl);
    } catch (err) {
      alert("Invalid URL. Please enter a valid URL.");
      console.error(err);
      return;
    }

    setLoading(true);
    setError("");

    const apiCall = async (): Promise<ShortenUrlResponse> => {
      const res = await fetch(
        "http://localhost:3000/create?" +
          new URLSearchParams({ url: url }).toString(),
        {
          method: "POST",
        },
      );
      if (!res.ok) {
        throw new Error("Failed API call");
      }
      return res.json();
    };

    circuitBreaker
      .call<ShortenUrlResponse>(apiCall)
      .then((data) => {
        const shortenedLinkContainer = document.getElementById(
          "shortened",
        )! as HTMLDivElement;

        const link = shortenedLinkContainer.querySelector(
          "a",
        )! as HTMLAnchorElement;
        link.href = normalizedUrl;
        link.textContent = data.shortened_url;
        link.target = "_blank"; // Open the link in a new tab

        shortenedLinkContainer.appendChild(link);

        const shortenedIdContainer = document.getElementById(
          "shortened-id",
        )! as HTMLDivElement;
        (
          shortenedIdContainer.querySelector("p")! as HTMLSpanElement
        ).textContent = data.id;
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
        setCircuitState(circuitBreaker.getState());
      });

    setUrl("");
  };

  return (
    <div className="w-fit p-6 rounded-xl shadow-xl bg-zinc-500/20">
      <h1 className="mx-auto my-4 text-center text-3xl font-bold">
        URL Shortener
      </h1>

      <form
        className="mx-auto mt-8 mb-4 max-w-3xl flex gap-x-2"
        onSubmit={onSubmit}
      >
        <input
          id="url"
          className="w-screen h-12 m-4 p-4 rounded-lg border border-gray-400/20 outline-none hover:border-[#646cff]/65 hover:shadow-sm focus:border-[#646cff] transition duration-300 font-medium"
          type="text"
          placeholder="Input URL here. Ex: 'https://example.com'"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <div className="w-fit mx-auto">
          <button type="submit" className="h-12 m-4" disabled={loading}>
            {loading ? <div className="loader"></div> : "Shorten!"}
          </button>
        </div>
      </form>

      {error && <p className="text-red-500 text-center">Error: {error}</p>}
      <p className="text-center font-bold mb-8 text-lg">
        Circuit State: {CircuitState[circuitState]}
      </p>

      <div className="mx-auto my-4 max-w-3xl flex">
        <div
          id="shortened"
          className="mx-4 my-auto h-12 p-4 grow hover:grow-[2] rounded-lg border-2 border-gray-400/50 outline-none hover:border-[#646cff]/65 hover:shadow-sm focus:border-[#646cff] transition-all duration-300 font-medium flex items-center overflow-x-auto overflow-y-hidden"
        >
          <span className="mr-2">
            <strong>Shortened URL:</strong>
          </span>
          <a href=""></a>
        </div>
        <div
          id="shortened-id"
          className="mx-4 my-auto h-12 p-4 grow rounded-lg border-2 border-gray-400/50 outline-none hover:border-[#646cff]/65 hover:shadow-sm focus:border-[#646cff] transition-all duration-300 font-medium flex items-center overflow-x-auto overflow-y-hidden"
        >
          <span className="mr-2">
            <strong>ID:</strong>
          </span>
          <p></p>
        </div>
      </div>
    </div>
  );
}

export default ShortenUrl;
