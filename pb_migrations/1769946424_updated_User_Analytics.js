/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2187125888")

  // update field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "number1072915430",
    "max": null,
    "min": 0,
    "name": "view_count",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2187125888")

  // update field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "number1072915430",
    "max": null,
    "min": 0,
    "name": "View_Counter",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
})
