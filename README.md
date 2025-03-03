[![Build](https://github.com/mlocati/zip-differ/actions/workflows/build.yml/badge.svg)](https://github.com/mlocati/zip-differ/actions/workflows/build.yml)

# Zip Differ

This tool allows you comparing the contents of ZIP archives, both loading them from your computer of from an URL (provided that it's correctly configured for [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)).
It's a client-only tool: the archives and their content never leave your computer.

Do you want a sample demo? [Here it is](https://mlocati.github.io/zip-differ/?left=sample-data/a.zip&right=sample-data/b.zip).

## Start Options

Initial options can be specified via querystring parameters:

- `left` the URL of the left archive
- `right` the URL of the right archive
- `left.credentials` can be:
  - `omit` to never send credentials when fetching the left archive from an URL
  - `same-origin` (default) to send credentials for same-origin requests
  - `include` to always send credentials
- `right.credentials` same as `left.credentials` but for the archive on the right
- `left.redirect` can be:
  - `yes` (default) to follow redirects when fetching the left archive from an URL
  - `no` to not follow redirects
- `right.redirect` same as `left.redirect` but for the archive on the right
- `autocompare` set to `yes` to automatically open the Compare view when the left and right URLs are specified.

## Development

### Install dependencies (keeping the configured one)

```sh
npm ci
```

### Install dependencies (updating to the latest available versions)

```sh
npm install
```

### Build for development

```sh
npm run dev
```

### Checking coding style

```sh
npm run lint
```

### Fixing coding style

```sh
npm run lint:fix
```

### Build for production

```sh
npm run build
```

### Preview the app built for production

```sh
npm run preview
```
