/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3606156036")

  // remove field
  collection.fields.removeById("number3821437763")

  // add field
  collection.fields.addAt(13, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text3821437763",
    "max": 0,
    "min": 0,
    "name": "unique_id",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
}, (app) => {
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

  // remove field
  collection.fields.removeById("text3821437763")

  return app.save(collection)
})
