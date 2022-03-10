import { Client, Entity, Schema } from "redis-om";

const client = new Client();

const connect = async () => {
  if (!client.isOpen()) {
    await client.open(process.env.REDIS_URL);
  }
};

class Car extends Entity {}

let schema = new Schema(
  Car,
  {
    make: { type: "string" },
    model: { type: "string" },
    image: { type: "string" },
    description: { type: "text" },
  },
  { dataStructure: "JSON" },
);

export const createCar = async (data) => {
  await connect();

  const repository = client.fetchRepository(schema);
  const car = repository.createEntity(data);
  return await repository.save(car);
};

export const createIndex = async () => {
  await connect();

  const repository = client.fetchRepository(schema);
  await repository.createIndex();
};

export const searchCars = async (q) => {
  await connect();

  const repository = client.fetchRepository(schema);
  return await repository.search()
                         .where("make")
                         .eq(q)
                         .or("model")
                         .eq(q)
                         .or("description")
                         .matches(q)
                         .return
                         .all();
};