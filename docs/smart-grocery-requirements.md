# Smart Grocery Requirements

Smart Grocery is a modern web app for building grocery lists, estimating grocery costs, tracking shopping progress, and maintaining a personal grocery catalog.

The project should stay simple enough for continuous Agile development. Build useful pieces early, avoid overengineering, and keep each phase small.

## Current Access Decision

The product will be an invitation-only SaaS application for the owner, family,
and explicitly approved people. Fix reliability first; implement accounts in
the next milestone. Account approval and access to a specific list are separate
permissions. All private data access must be enforced in the API, not only the UI.

The accounts milestone must preserve existing lists by assigning them to the
owner, replace globally unique list names with an owner-aware policy, protect
the shared catalog, and include tests preventing access across users. Follow
with personal products, per-user preferences, list membership and revocable
invitations. Sharing a list must not share the owner's private preferences or
entire personal catalog. Public self-registration is not the default.

This decision supersedes older descriptions below where they conflict. The
current frontend uses React JavaScript and Material UI.

## Agreed Direction

- Build the real app around persisted product data instead of expanding fake in-memory inventory.
- Start database-first because the product catalog drives search, shopping-list items, and saved trips.
- Use PostgreSQL, not SQLite.
- Keep the existing estimator code as a learning artifact until it is replaced by the real product/list flow.
- Build the Product Catalog API first, then the Current Shopping List workflow.

## Tech Stack

Backend:

- Python
- FastAPI
- SQLAlchemy
- PostgreSQL
- Alembic
- Pydantic
- Dataclasses

Frontend:

- React
- TypeScript
- Vite
- TailwindCSS
- shadcn/ui

Local development:

- Prefer Docker Compose for PostgreSQL.

## Architecture

Use a layered backend architecture.

Routes:

- Receive HTTP requests
- Validate request input through Pydantic schemas
- Call services
- Return response schemas

Services:

- Contain business logic
- Work with domain dataclasses
- Handle database access through the injected SQLAlchemy session
- Own SQLAlchemy queries and transaction boundaries

SQLAlchemy models:

- Represent database tables and relationships

Dataclass models:

- Represent business/domain objects used inside services

Pydantic schemas:

- Represent HTTP request and response shapes only

## Planned Structure

```text
backend/
    app/
        core/
        products/
            router.py
            services.py
            models.py
            schemas.py
        shopping_lists/
            router.py
            services.py
            models.py
            schemas.py
        categories/
            models.py
        main.py

frontend/
    React + TypeScript + Vite app

docker-compose.yml
```

## Database

Use PostgreSQL.

Phase 1 tables:

- `products`
- `shopping_lists`
- `shopping_list_items`

## Product

A Product represents something sold by a store. Do not store quantity in Product.

Fields:

- `id`
- `name`
- `brand`
- `description`
- `category`
- `store`
- `barcode`
- `sku`
- `size`
- `last_updated`

Examples:

- Great Value Whole Milk, 1 gallon
- Great Value Eggs, 12 count

## Shopping List Item

A ShoppingListItem represents a product added to a specific shopping list.

Fields:

- `id`
- `shopping_list_id`
- `product_id`
- `name`
- `quantity`
- `size`
- `found`
- `in_cart`
- `added_by`

Important:

- Name and category are copied from the product when it is added.
- List-item copies can later be edited without changing the catalog product.

Example:

```text
Product name: Whole Milk
Quantity: 2
Shopping list item name: Whole Milk
```

## Shopping List

Fields:

- `id`
- `share_code`
- `store`
- `zip_code`
- `created_by`
- `created_at`
- `updated_at`
- `status`

Summary values can be calculated from list items:

- `total_items`
- `items_found`
- `items_not_found`
- `collected_items_count`

Do not store these summary values in Phase 1 unless we discover a clear reason. Calculating them keeps the first version simpler and avoids stale totals.

## Main Areas

Phase 1 has two primary areas:

- Current Shopping List
- Product Catalog

## Product Catalog

Users can maintain their own grocery database.

Features:

- View products
- Search products
- Add product
- Edit product
- Delete product

## Current Shopping List

The shopping list is the application's home page.

Users should be able to build a list without opening the catalog.

Core workflow:

- Search products from the catalog
- Show matching product suggestions immediately
- Display product name, category, and package size
- Allow an optional image on an individual shopping-list item
- Add a product to the current list
- Ask for quantity, defaulting to 1

## Quantity

Each shopping-list row supports quick quantity changes:

```text
[-] 2 [+]
```

Changing quantity updates the list immediately.

Shopping-list items use a fixed unit selector. Count-based units use whole
steps, while weight and volume units support decimal quantities. Unit
conversion is outside the MVP.

## Optional Pricing

- Shopping-list item prices are optional.
- Shared catalog products do not store personal prices.
- Unknown prices remain empty rather than defaulting to zero.
- The summary displays an estimated total only when at least one list item
  has a price.
- Per-user remembered prices can be added later with user product preferences.
- Product names do not belong in preferences. A changed reusable name creates
  or reuses a user-owned product; an unchanged name keeps the shared product.
- Store-specific prices and price history are future features.

## Paste List

Add a future tab called Paste List.

Users can paste text from WhatsApp:

```text
2 milk
eggs
bread
```

The backend parses each line. If multiple products match, the UI should show suggestions.

This can come after the basic product search and list workflow.

## List Table

Columns:

- Checkbox
- Product
- Quantity
- Size
- Actions

Use only one checkbox.

When checked:

- Strike through the product
- Update progress
- If all items are checked, mark the list completed

## Summary Card

Show:

- Items
- Found
- Missing
- Collected
- Remaining
- Progress Bar

## Recent Lists

Save every shopping trip automatically.

Display:

- Store
- Date
- Status
- Items

Users can reopen previous trips.

## UI Direction

Style:

- Modern SaaS dashboard
- White background
- Green accent color
- Rounded cards
- Clean, usable, minimal while building

Left sidebar:

- Current List
- Saved Lists
- Product Catalog
- Stores
- Scan Barcode
- Reports
- Settings

Bottom sidebar profile:

- Leonardo
- Premium Plan

Top bar:

- Store dropdown
- ZIP
- Theme toggle
- Notification icon

## MVP Exclusions

Do not implement in Phase 1:

- Authentication
- Barcode scanning
- Real-time collaboration
- WebSockets
- Walmart scraping
- Push notifications
- Store-specific price tracking and price history

## Future Ready

Design so these can be added later:

- Shared shopping lists
- Households
- Barcode scanning
- Real-time updates
- Walmart scraper
- Price history
- Store comparison
- Mobile app

## Phase 1 Milestones

1. PostgreSQL foundation
   - Docker Compose database
   - SQLAlchemy session setup
   - Alembic migrations

2. Product Catalog backend
   - Product SQLAlchemy table
   - Product dataclass
   - Product schemas
   - Product service and database queries
   - Product routes
   - Seed a few useful products

3. Shopping List backend
   - ShoppingList and ShoppingListItem tables
   - Create/open current list
   - Add product to list with copied name and category
   - Increase/decrease quantity
   - Check item as collected
   - Calculate list progress

4. Minimal React UI
   - Sidebar shell
   - Current List page
   - Product search suggestions
   - List table
   - Summary card
   - Product Catalog page

## First Build Target

The first useful backend target is Product Catalog API:

- Add product
- Search products
- List products
- Update product
- Delete product

After that, build the Current Shopping List workflow on top of real product data.

## Production Direction

The app should be deployable later as a real production app on a Debian VPS.

Recommended production architecture:

```text
Debian VPS
    Docker Compose
        reverse-proxy
        frontend
        backend
        postgres
```

Service responsibilities:

- `reverse-proxy`: public entry point, handles HTTP/HTTPS and routes traffic
- `frontend`: serves the built React/Vite static app, likely through Nginx
- `backend`: runs the FastAPI API
- `postgres`: runs PostgreSQL with persistent storage

Recommended reverse proxy:

- Caddy is preferred for a small VPS because it can manage HTTPS certificates automatically.
- Nginx or Traefik are also valid alternatives.

Production request flow:

```text
Internet
    -> reverse-proxy on ports 80/443
    -> frontend for React pages
    -> backend for /api routes
    -> postgres privately through Docker network
```

Production rule:

- Only the reverse proxy should expose public ports.
- PostgreSQL should not expose `5432` publicly.
- Backend should connect to PostgreSQL through the Compose service name:

```text
postgresql+psycopg://user:password@postgres:5432/smart_grocery
```

Local development can stay simpler:

```text
Docker Compose:
    postgres only

Local terminal:
    backend in Python venv
    frontend in Vite dev server
```

## Frontend Production Direction

The React frontend is built with Vite into static files.

In production, React does not need a Node.js server unless we later add server-side rendering.

Recommended production options:

1. Serve frontend from a container:
   - Build React with Node
   - Copy `dist/` into an Nginx container
   - Let the reverse proxy route frontend traffic to it

2. Serve frontend from host Nginx/Caddy:
   - Build React
   - Copy `dist/` to a server directory
   - Let host web server serve static files

Preferred long-term Docker-only production setup:

```text
reverse-proxy
frontend
backend
postgres
```

Frontend API calls should use relative URLs:

```text
/api/products
```

Do not hardcode localhost API URLs in frontend production code.

## Production Backup Strategy

Back up anything users create or anything needed to restore production that is not already in Git.

For MVP, the main backup target is PostgreSQL.

Back up PostgreSQL with `pg_dump`.

Backup scope:

- PostgreSQL database: required
- Uploaded/user files: required later if uploads are added
- Application code: stored in Git, not part of database backup
- Production secrets/config: store securely outside Git, such as in a password manager

Examples of database-backed app data:

- Products
- Shopping lists
- Shopping list items
- Future users
- Future price history

If uploads are added later, back up the upload storage too:

```text
/srv/smart-grocery/uploads
```

or use object storage such as S3, Backblaze B2, Cloudflare R2, or similar.

Basic production backup plan:

```text
Daily pg_dump
Compress backup files
Keep short-term local backups
Copy backups off the VPS
Periodically test restore
```

Important:

- A backup stored only on the same VPS is not enough.
- Local VPS backups protect against bad migrations or accidental deletes.
- Off-server backups protect against VPS failure.
- A backup that has never been restored is not fully proven.
