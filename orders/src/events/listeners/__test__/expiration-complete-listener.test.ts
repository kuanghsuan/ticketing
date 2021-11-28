import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { ExpirationCompleteListener } from "../expiration-complete-listener";
import mongoose from "mongoose";
import { Order, OrderStatus } from "../../../models/order";
import { ExpirationCompleteEvent } from "@kuangtickets/common";
import { Message } from "node-nats-streaming";

const setup = async () => {
    const listenr = new ExpirationCompleteListener(natsWrapper.client);

    const ticket = Ticket.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      title: "concert",
      price: 10,
    });

    await ticket.save();

    const order = Order.build({
        status: OrderStatus.Created,
        userId: 'sefsdgs',
        expiresAt: new Date(),
        ticket
    });

    await order.save();

    const data: ExpirationCompleteEvent['data'] = {
        orderId: order.id
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

    return { listenr, order, ticket, data, msg };
}

it('update the order status to cancelled', async () => {
    const { listenr, order, ticket, data, msg } = await setup();
    await listenr.onMessage(data, msg);
    const updateOrder = await Order.findById(order.id);
    expect(updateOrder!.status).toEqual(OrderStatus.Cancelled);
});

it("emit an orderCancelled event", async () => {
    const { listenr, order, ticket, data, msg } = await setup();
    await listenr.onMessage(data, msg);
    expect(natsWrapper.client.publish).toHaveBeenCalled();
    const eventData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
    expect(eventData.id).toEqual(order.id);
});

it("ack the message", async () => {
    const { listenr, order, ticket, data, msg } = await setup();
    await listenr.onMessage(data, msg);
    expect(msg.ack).toHaveBeenCalled();
});