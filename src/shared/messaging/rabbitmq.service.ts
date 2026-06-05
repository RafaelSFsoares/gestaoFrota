import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Channel, ChannelModel, ConsumeMessage, connect } from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private connection: ChannelModel;
  private channel: Channel;
  private readonly exchange = 'vehicle.events';
  private readonly queue = 'vehicle_events_queue';
  private readonly logger = new Logger(RabbitMQService.name);

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const url = this.configService.get<string>('RABBITMQ_URL', 'amqp://guest:guest@localhost:5672/');
    this.connection = await connect(url);
    this.channel = await this.connection.createChannel();
    await this.channel.assertExchange(this.exchange, 'topic', { durable: true });
    await this.channel.assertQueue(this.queue, { durable: true });
    await this.channel.bindQueue(this.queue, this.exchange, 'vehicle.*');
    await this.startConsumer();
    this.logger.log('RabbitMQ connection established and consumer started');
  }

  async onModuleDestroy() {
    await this.channel.close();
    await this.connection.close();
  }

  async publish(routingKey: string, payload: unknown): Promise<boolean> {
    const content = Buffer.from(JSON.stringify(payload));
    return this.channel.publish(this.exchange, routingKey, content, { persistent: true });
  }

  private async startConsumer() {
    await this.channel.consume(
      this.queue,
      async (message: ConsumeMessage | null) => {
        if (!message) return;
        try {
          const content = JSON.parse(message.content.toString());
          this.logger.log(`Received event ${message.fields.routingKey}: ${JSON.stringify(content)}`);
          await this.channel.ack(message);
        } catch (error) {
          this.logger.error('Error processing RabbitMQ message', error);
          await this.channel.nack(message, false, false);
        }
      },
      { noAck: false },
    );
  }
}
