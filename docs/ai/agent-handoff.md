# Agent handoff

## Current objective

PRODUCT-001 — dynamic individual product page based on docs/reference/Product.
Implementation, source unification and local validation complete on feat/unified-product-pages, based on
origin/main at 3b2419f (cart PR #10 merged). The cart work was published as PR #10; this product work has
not been committed, pushed or added to a PR. create-pr preparation is complete;
publication awaits the single final approval.

## Completed

- Public catalog product lookup by UUID or slug, categories and current stock.
- All 20 homepage fixtures seeded as persisted products, retaining p1–p20 slugs.
  Shared config/demo-products.json feeds homepage and seed:demo; no overwrite.
- Existing schema, module boundaries, authentication and cart persistence preserved.
- Shared api-contract/OpenAPI updated; three-column detail layout, specifications,
  category rails and existing header/navbar/footer/cards reused.
- Chosen quantity through CartProvider.add, default one preserved for old callers.
  Real cart items and cards link to the new detail route.
- Missing product/loading/error UI; inactive or no-stock records open but cannot be added.
- 56 unit tests, 26 isolated PostgreSQL integrations, full build/check sequence,
  OpenAPI generation and three manifests pass.
- Browser confirms all 24 permanent products plus three temporary incomplete
  records; 20 homepage links, 25 available records in the persisted cart, exact
  subtotal/count/reload, photo/placeholder responsiveness and no new normal-flow
  JS/console errors. Fixed duplicate sibling keys found in the first run.
- Existing full cart lifecycle, homepage baseline and 22 footer routes rechecked.

## Configuration and limits

Both cart and productDetails stay false in shared config/features.yaml. The ignored
.env.features.yaml enables them locally via FEATURES_FILE. API :3001 and storefront
:3000 run with the local PostgreSQL container. See docs/product-details.md.

Current product schema has no photo, review, discount, delivery or payment metadata.
The shared demo file supplies its existing images/previous prices by SKU+slug,
without overriding database price/stock. Missing fields have neutral fallbacks.
Demo stock is explicitly 10 in the fixture, not assumed for arbitrary real products.
The current photos are single-image; multi-image switching remains component-tested.
“Comprar agora” is explicitly disabled: checkout is still a placeholder.
Homepage p1–p20 links now resolve to persisted slugs. Run seed:demo for older DBs;
normal seed also includes them. Arbitrary new DB products work without fixtures.
Product listing is out of scope. No schema, migrations, seed or dependency change.

## Preserved changes and follow-up

The user added docs/reference/Product and modified docs/reference/.DS_Store before
this task. Do not revert those changes. Local environment files must remain ignored.

Legacy internal CartService.markConverted and CatalogService.findBySlug still lack
direct tests; neither is used by this new detail flow. getProduct has real integration
coverage. No Docker image builds, deployment or drift checks in this run.
The original favicon 404 and toolchain deprecation warnings remain.
