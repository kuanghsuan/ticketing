import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { ConnectOptions } from 'mongoose';
import request from 'supertest';
import { app } from '../app';

declare global {
    var signin: () => Promise<string[]>;
}


let mongo: any;
beforeAll(async () => {
  process.env.JWT_KEY = 'asdfasdf';

  mongo = new MongoMemoryServer();
  await mongo.start();
  const mongoUri = await mongo.getUri();

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  } as ConnectOptions);
});

beforeEach(async () => {
  jest.setTimeout(60000);
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

global.signin = async () => {
    const email = 'test@test.com';
    const password = 'password';

    const response = await request(app)
        .post('/api/users/signup')
        .send({
            email, password
        })
        .expect(200);
    const cookie = response.get('Set-Cookie');

    return cookie;
};

//declare global {
//    var signin: () => Promise<string[]>;
//}