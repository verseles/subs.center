# Simple Subscription Manager

#### Keep track of your streaming services, online accounts, and more.

https://subs.helio.me

## Features

- [x] Automatically get service icon
- [x] Theme settings: system, light, or dark (dark by default)
- [x] Add, delete subscriptions
- [x] Templates for popular services
- [x] Slide to delete
- [x] Show total cost
- [x] Currency symbol based on the browser locale
- [x] App icon
- [x] Local storage
- [x] PWA
- [ ] Add, Edit, delete categories
- [ ] Edit subscriptions
- [ ] Export, import data
- [x] Optional cross-device subscription sync via a shared key
- [ ] Native mobile app
- [ ] Browser extension

## Settings and synchronization

Open **Settings** to choose the theme for this device. To synchronize subscriptions,
enter a personal key or generate one, then choose **Create / connect**. Use **Use
existing key** on another device; this action requires the shared document to
exist already. You can copy a valid key at any time, including before connecting.
The app adds `subs-` internally to remote identifiers; only the key without that
prefix is shown or copied. Disconnecting stops syncing on that device without
deleting its subscriptions or the shared document.

Changes are saved locally immediately, then reconciled with the shared document
when the network is available. Newer per-subscription changes generally win;
deletions and undo are synchronized. The document has a schema version and keeps
additional JSON fields for future features. The API at https://kv.helio.me is
**public and unauthenticated**: anyone who knows or guesses a key can read,
overwrite, or delete its data. Do not store confidential information. It has no
conditional writes, so simultaneous updates may conflict despite reconciliation;
device clock differences can also affect which change wins. A missing shared
document after connection is reported instead of recreated automatically.

### Tests

```bash
npm test
```

## Development

### Install the dependencies

```bash
npm install
```

### Development mode

> hot-code reloading, error reporting, etc.

```bash
npm run dev
```

### Lint the files

```bash
npm run lint
```

### Format the files

```bash
npm run format
```

### Build PWA for production

```bash
npm run build
```

### Customize the configuration

See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js).
