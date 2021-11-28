import { Publisher, OrderCreatedEvent, Subjects } from "@kuangtickets/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
}