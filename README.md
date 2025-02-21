[![Build](https://github.com/mlocati/zip-differ/actions/workflows/build.yml/badge.svg)](https://github.com/mlocati/zip-differ/actions/workflows/build.yml)

# Zip Differ

This tool allows you comparing the contents of ZIP archives, both loading them from your computer of from an URL (provided that it's correctly configured for [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)).
It's a client-only tool: the archives and their content never leave your computer.

Want a sample demo? [Here it is](https://mlocati.github.io/zip-differ/?left=sample-data/a.zip&right=sample-data/b.zip).

## A brief introductory video

[![Zip Differ intro](https://img.youtube.com/vi/gA0uqBeGDPg/0.jpg)](https://youtu.be/gA0uqBeGDPg)

## Compilation

Install dependencies (keeping the configured one)

```sh
npm ci
```

Install dependencies (updating to the latest available versions)

```sh
npm install
```

Build for development

```sh
npm run dev
```

Build for production

```sh
npm run build
```

Preview the app built for production

```sh
npm run preview
```
