using System;
using System.Text;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;

namespace expirationNetCo
{
    class Program
    {
        static void Main(string[] args)
        {
            try
            {
                var rabbitUser = Environment.GetEnvironmentVariable("RABBIT_USER");
                var rabbitPassword = Environment.GetEnvironmentVariable("RABBIT_PASSWORD");
                var rabbitUrl = Environment.GetEnvironmentVariable("RABBIT_URL");

                Console.WriteLine($"amqp://{rabbitUser}:{rabbitPassword}@{rabbitUrl}");

                var factory = new ConnectionFactory()
                {
                    UserName = rabbitUser,
                    Password = rabbitPassword,
                    HostName = rabbitUrl
                };
                using (var connection = factory.CreateConnection())
                using (var channel = connection.CreateModel())
                {
                    channel.ExchangeDeclare(exchange: "order:created", type: "direct", durable: true);
                    var routingKey = "orders";
                    var queueName = channel.QueueDeclare().QueueName;

                    channel.QueueBind(
                        queue: queueName,
                        exchange: "order:created",
                        routingKey: routingKey

                    );

                    Console.WriteLine(" [*] Waiting for messages.");

                    var consumer = new EventingBasicConsumer(channel);
                    consumer.Received += (model, ea) =>
                    {
                        var body = ea.Body.ToArray();
                        var message = Encoding.UTF8.GetString(body);
                        var routingKey = ea.RoutingKey;
                        Console.WriteLine(" [x] Received '{0}':'{1}'",
                                          routingKey, message);
                    };
                    channel.BasicConsume(queue: queueName,
                                         autoAck: true,
                                         consumer: consumer);
                }
            }
            catch (System.Exception error)
            {
                Console.WriteLine(error);
            }
        }
    }
}
