import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledListener } from "../order-cancelled-listener";
import mongoose from "mongoose";
import { OrderStatus, OrderCancelledEvent } from "@kuangtickets/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../../models/order";

const setup = async () => {
    const listener = new OrderCancelledListener(natsWrapper.client);

    const order = Order.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      status: OrderStatus.Created,
      price: 10,
      userId: 'sefsd',
      version: 10
    });
    await order.save();

    const data: OrderCancelledEvent["data"] = {
      id: order.id,
      version: 1,
      ticket: {
        id: "asevcsdvsd",
      },
    };

    const msg: Message = {
    ack: jest.fn(),
    getSubject: function (): string {
      throw new Error("Function not implemented.");
    },
    getSequence: function (): number {
      throw new Error("Function not implemented.");
    },
    getRawData: function (): Buffer {
      throw new Error("Function not implemented.");
    },
    getData: function (): String | Buffer {
      throw new Error("Function not implemented.");
    },
    getTimestampRaw: function (): number {
      throw new Error("Function not implemented.");
    },
    getTimestamp: function (): Date {
      throw new Error("Function not implemented.");
    },
    isRedelivered: function (): boolean {
      throw new Error("Function not implemented.");
    },
    getCrc32: function (): number {
      throw new Error("Function not implemented.");
    },
  };

  return { listener, data, msg, order };
}

it('replicates the order info', async () => {
    const { listener, data, msg, order } = await setup();
    await listener.onMessage(data, msg);

    const updatedOrder = await Order.findById(order.id);



    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('acks the ,essage', async () => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);
    

    expect(msg.ack).toHaveBeenCalled();
});