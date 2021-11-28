import { Message } from 'node-nats-streaming';
import { TicketUpdatedEvent } from "@kuangtickets/common";
import { TicketUpdatedListener } from "../ticket-updated-listener";
import { natsWrapper } from "../../../nats-wrapper";
import mongoose from "mongoose";
import { Ticket } from '../../../models/ticket';


const setup = async () => {
    const listener = new TicketUpdatedListener(natsWrapper.client);
    const ticket = Ticket.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      title: "concert",
      price: 10
    });

    await ticket.save();

    const data: TicketUpdatedEvent["data"] = {
      version: ticket.version + 1,
      id: ticket.id,
      title: "new concert",
      price: 999,
      userId: new mongoose.Types.ObjectId().toHexString(),
    };

    const msg: Message = {
        ack: jest.fn(),
        getSubject: function (): string {
            throw new Error('Function not implemented.');
        },
        getSequence: function (): number {
            throw new Error('Function not implemented.');
        },
        getRawData: function (): Buffer {
            throw new Error('Function not implemented.');
        },
        getData: function (): String | Buffer {
            throw new Error('Function not implemented.');
        },
        getTimestampRaw: function (): number {
            throw new Error('Function not implemented.');
        },
        getTimestamp: function (): Date {
            throw new Error('Function not implemented.');
        },
        isRedelivered: function (): boolean {
            throw new Error('Function not implemented.');
        },
        getCrc32: function (): number {
            throw new Error('Function not implemented.');
        }
    };

    return { listener, data, msg, ticket };
};

it('creates and saves a ticket', async () => {
    const { listener, data, msg, ticket } = await setup();

    await listener.onMessage(data, msg);
    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket).toBeDefined();
    expect(updatedTicket!.title).toEqual(data.title);
    expect(updatedTicket!.price).toEqual(data.price);
    expect(updatedTicket!.version).toEqual(data.version);
});

it("acks the message", async () => {
    const { listener, data, msg, ticket } = await setup();
    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});

it("does not call ack if the event has a skipped version number", async () => {
  const { listener, data, msg, ticket } = await setup();

  data.version = 10;
  
  try {
    await listener.onMessage(data, msg);
  } catch (err) {
  }
  expect(msg.ack).not.toHaveBeenCalled();
});