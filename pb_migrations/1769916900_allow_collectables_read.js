/// <reference path="../pb_data/types.d.ts" />
// Allow API read access (list + view) for collectables so social page can GET rows by unique_id
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3606156036");
  collection.listRule = "";
  collection.viewRule = "";
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3606156036");
  collection.listRule = null;
  collection.viewRule = null;
  return app.save(collection);
});
