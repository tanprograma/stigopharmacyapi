import { MedicineModel } from "../models/medicine.mjs";
import { StoreModel } from "../models/store.mjs";
import express from "express";
import { LogModel } from "../models/log.mjs";
import { InventoryModel } from "../models/inventory.mjs";
const router = express.Router();
router.get("/", async (req, res) => {
  const resource = await MedicineModel.find();
  await LogModel.create({
    log: `get log medicines:sent ${resource.length} medicines`,
  });
  res.send(resource);
});
router.post("/create", async (req, res) => {
  const resource = await MedicineModel.create(req.body);
  const stores = await StoreModel.find();
  if (stores.length) {
    for (let i = 0; i < stores.length; i++) {
      await createInventory(resource, stores[i]);
    }
  }
  await LogModel.create({
    log: `create log medicines:created ${resource.name}`,
  });
  res.send(resource);
});
router.post("/create/many", async (req, res) => {
  const resource = await MedicineModel.create(req.body);
  await LogModel.create({
    log: `create log medicines:created ${resource.length} records`,
  });
  const stores = await StoreModel.find();
  if (stores.length && resource.length) {
    for (let i = 0; i < stores.length; i++) {
      await createInventories(resource, stores[i]);
    }
  }

  res.send(resource);
});
async function createInventories(items, store) {
  for (let i = 0; i < items.length; i++) {
    await createInventory(items[i], store);
  }
}
async function createInventory(item, store) {
  const inventory = await InventoryModel.create({
    outlet: store.name,
    commodity: item.name,
    unit: item.unit,
    unit_value: item.unit_value,
  });
  await inventory.save();
  await LogModel.create({
    log: `create log medicines:created inventory ${inventory.commodity} in ${store.name} inventories`,
  });
}
export default router;
