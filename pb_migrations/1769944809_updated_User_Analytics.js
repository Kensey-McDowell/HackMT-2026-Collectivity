/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2187125888")

  // update collection data
  unmarshal({
    "deleteRule": "user = @request.auth.id",
    "listRule": "user = @request.auth.id",
    "viewRule": "user = @request.auth.id"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2187125888")

  // update collection data
  unmarshal({
    "deleteRule": "",
    "listRule": "",
    "viewRule": ""
  }, collection)

  return app.save(collection)
})
