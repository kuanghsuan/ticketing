import { Subjects, Publisher, PaymentCreatedEvent } from "@kuangtickets/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}