import { Message } from "node-nats-streaming";
import { OrderCreatedListener } from "../order-created-listener";
import { OrderCreatedEvent, OrderStatus } from "@kuangtickets/common";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from "../../../models/ticket";
import mongoose from "mongoose";

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client);
  const ticket = Ticket.build({
    title: "concert",
    price: 10,
    userId: "aefsdvxv",
  });
  await ticket.save();

  const data: OrderCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: "aefsdvxv",
    expiresAt: "aefsdvxv",
    ticket: {
      id: ticket.id,
      price: ticket.price,
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

  return { listener, ticket, data, msg};
};

it("sets the userId of the ticket", async () => {
    const { listener, ticket, data, msg } = await setup();
    await listener.onMessage(data, msg);
    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.orderId).toEqual(data.id);


});

it("acks the message", async () => {
  const { listener, ticket, data, msg } = await setup();
  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it("published a ticket updated event", async () => {
  const { listener, ticket, data, msg } = await setup();
  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const ticketUpdatedData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );

  expect(data.id).toEqual(ticketUpdatedData.orderId);
});