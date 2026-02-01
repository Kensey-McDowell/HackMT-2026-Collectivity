/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4232161582")

  // add field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "date3042278353",
    "max": "",
    "min": "",
    "name": "event_date",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4232161582")

  // remove field
  collection.fields.removeById("date3042278353")

  return app.save(collection)
})
