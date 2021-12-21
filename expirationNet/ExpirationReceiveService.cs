using System;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;

namespace expirationNet
{
    public class ExpirationReceiveService : BackgroundService
    {
        private IServiceProvider _sp;
        private ConnectionFactory _factory;
        private IConnection _connection;
        private IModel _channel;
        private string _queueName;

        public ExpirationReceiveService(IServiceProvider sp)
        {
            _sp = sp;
            var rabbitUser = Environment.GetEnvironmentVariable("RABBIT_USER");
            var rabbitPassword = Environment.GetEnvironmentVariable("RABBIT_PASSWORD");
            var rabbitUrl = Environment.GetEnvironmentVariable("RABBIT_URL");

            _factory = new ConnectionFactory()
            {
                UserName = rabbitUser,
                Password = rabbitPassword,
                HostName = rabbitUrl
            };
            _connection = _factory.CreateConnection();
            _channel = _connection.CreateModel();
            _channel.ExchangeDeclare(
                exchange: "order:created",
                type: "direct",
                durable: true
            );
            // _channel.QueueDeclare(queue: "heroes", durable: false, exclusive: false, autoDelete: false, arguments: null);
            var routingKey = "orders";
            _queueName = _channel.QueueDeclare("", exclusive: true).QueueName;

            _channel.QueueBind(
                queue: _queueName,
                exchange: "order:created",
                routingKey: routingKey
            );

        }

        protected override Task ExecuteAsync(CancellationToken stoppingToken)
        {
            if (stoppingToken.IsCancellationRequested)
            {
                _channel.Dispose();
                _connection.Dispose();

                return Task.CompletedTask;
            }

            var consumer = new EventingBasicConsumer(_channel);
            consumer.Received += (model, ea) =>
            {
                var body = ea.Body.ToArray();
                var message = Encoding.UTF8.GetString(body);
                var routingKey = ea.RoutingKey;
                Console.WriteLine(" [x] Received '{0}':'{1}'",
                                  routingKey, message);
            };

            _channel.BasicConsume(
                queue: _queueName,
                autoAck: true,
                consumer: consumer
            );


            return Task.CompletedTask;
        }
    }
}