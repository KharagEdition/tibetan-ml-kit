# tibetan-ml-kit

Tibetan MLKt

# Tibetan MLKt for JavaScript

> [!CAUTION]
> **Using Tibetan MLKit SDK for JavaScript directly from a client-side app is
> recommended for prototyping only.** If you plan to enable billing, we strongly
> recommend that you call the Google AI Gemini API only server-side to keep your
> API key safe. You risk potentially exposing your API key to malicious actors
> if you embed your API key directly in your JavaScript app or fetch it remotely
> at runtime.

The Tibetan MLKit SDK enables developers to use Google's state-of-the-art generative AI models (like Gemini) to build AI-powered features and applications. This SDK supports use cases like:
- Generate text from text-only input
- _(for Node.js)_ Embedding

You can use this JavaScript SDK for applications built with Node.js or for web apps.

For example, with just a few lines of code, you can access Gemini's multimodal capabilities to generate text from text-and-image input.

**MLKit includes**

1.  Online translation.\
`git clone https://github.com/google/generative-ai-js`

2.  Chat in Tibetan using Gemini model.
3.  and more coming soon...

To initate chat in Node.js:
```js
const server = http.createServer(app);
const tibetanMlKit = new TibetanMlKit(server, {
  apiKey: "API_KEY",
  modelName: "gemini-1.5-flash-latest",
});
```

To transate in Node.js:
```js
 const data = await TibetanMlKit.translateWithSync({
      input: "test",
      direction: "bo",
    });
    return res.json(data);
```

