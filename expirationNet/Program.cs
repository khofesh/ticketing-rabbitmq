using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;

namespace expirationNet
{
    public class Program
    {
        public static void Main(string[] args)
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
                    var queueName = channel.QueueDeclare("", exclusive: true).QueueName;

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
                    channel.BasicConsume(
                        queue: queueName,
                        autoAck: true,
                        consumer: consumer
                    );
                }
            }
            catch (System.Exception error)
            {
                Console.WriteLine(error);
            }


            CreateHostBuilder(args).Build().Run();
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>();
                });
    }
}
