import { Message } from 'node-nats-streaming';
import { TicketCreatedEvent } from "@kuangtickets/common";
import { TicketCreatedListener } from "../ticket-created-listener";
import { natsWrapper } from "../../../nats-wrapper";
import mongoose from "mongoose";
import { Ticket } from '../../../models/ticket';


const setup = async () => {
    const listener = new TicketCreatedListener(natsWrapper.client);
    const data: TicketCreatedEvent["data"] = {
      version: 0,
      id: new mongoose.Types.ObjectId().toHexString(),
      title: "concert",
      price: 10,
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

    return { listener, data, msg };
};

it('creates and saves a ticket', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);
    const ticket = await Ticket.findById(data.id);
    expect(ticket).toBeDefined();
    expect(ticket!.title).toEqual(data.title);
    expect(ticket!.price).toEqual(data.price);
});

it("acks the message", async () => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});