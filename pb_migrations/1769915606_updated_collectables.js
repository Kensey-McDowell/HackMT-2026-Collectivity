/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3606156036")

  // add field
  collection.fields.addAt(13, new Field({
    "hidden": false,
    "id": "number3821437763",
    "max": null,
    "min": null,
    "name": "unique_id",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3606156036")

  // remove field
  collection.fields.removeById("number3821437763")

  return app.save(collection)
})
