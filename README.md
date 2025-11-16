# URL Vault

An open source bookmark management application. Organize, categorize, and manage your bookmarks with a modern and intuitive interface.

💡 Don't want to self-host? Try the managed cloud offering at [urlvault.dev](https://urlvault.dev)

## Installation

Clone the repository:

```bash
git clone https://github.com/lsherman98/url-vault.git
cd url-vault
```

Install dependencies:

```bash
pnpm install
```

## Development

**Terminal 1** - Start PocketBase server:

```bash
make pb
```

**Terminal 2** - Start the development server:

```bash
make dev
```

The application will be available at `http://localhost:5173` (or the port shown in your terminal).

## Deployment

Build the production executable:

```bash
make build
```

Copy the `pocketbase/server` executable to your server and run:

```bash
./server serve
```

A $4/month Digital Ocean droplet should work just fine.

## Additional Commands

Generate TypeScript types from PocketBase:

```bash
make types
```
