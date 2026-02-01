/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4232161582")

  // remove field
  collection.fields.removeById("text2134807182")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4232161582")

  // add field
  collection.fields.addAt(5, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text2134807182",
    "max": 0,
    "min": 0,
    "name": "field2",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
})
