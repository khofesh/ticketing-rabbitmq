## TODO

1. tests
2. implement amqp-connection-manager
3. logging service

## minikube

```sh
minikube start
skaffold config set --global local-cluster true
eval $(minikube -p minikube docker-env)
```

### IP

```shell
minikube ip
```

## krew

https://krew.sigs.k8s.io/docs/user-guide/setup/install/

download and install krew

```sh
(
  set -x; cd "$(mktemp -d)" &&
  OS="$(uname | tr '[:upper:]' '[:lower:]')" &&
  ARCH="$(uname -m | sed -e 's/x86_64/amd64/' -e 's/\(arm\)\(64\)\?.*/\1\2/' -e 's/aarch64$/arm64/')" &&
  KREW="krew-${OS}_${ARCH}" &&
  curl -fsSLO "https://github.com/kubernetes-sigs/krew/releases/latest/download/${KREW}.tar.gz" &&
  tar zxvf "${KREW}.tar.gz" &&
  ./"${KREW}" install krew
)
```

append the following line to `$HOME/.profile`

```sh
export PATH="${KREW_ROOT:-$HOME/.krew}/bin:$PATH"
```

check installation

```sh
[fahmad@ryzen ticketing]$  kubectl krew
krew is the kubectl plugin manager.
You can invoke krew through kubectl: "kubectl krew [command]..."

Usage:
  kubectl krew [command]

...
```

## install rabbitmq cluster operator

```sh
kubectl apply -f "https://github.com/rabbitmq/cluster-operator/releases/latest/download/cluster-operator.yml"
```

## install kubectl-rabbitmq plugin

https://www.rabbitmq.com/kubernetes/operator/install-operator.html

```sh
[fahmad@ryzen ticketing]$ kubectl krew install rabbitmq
Updated the local copy of plugin index.
Installing plugin: rabbitmq
Installed plugin: rabbitmq
\
 | Use this plugin:
 | 	kubectl rabbitmq
 | Documentation:
 | 	https://github.com/rabbitmq/cluster-operator
 | Caveats:
 | \
 |  | This plugin requires the RabbitMQ cluster operator to be installed.
 |  | To install the RabbitMQ cluster operator run `kubectl rabbitmq install-cluster-operator`.
 |  |
 |  | `tail` subcommand requires the `tail` plugin. You can install it with `kubectl krew install tail`.
 | /
/
WARNING: You installed plugin "rabbitmq" from the krew-index plugin repository.
   These plugins are not audited for security by the Krew maintainers.
   Run them at your own risk.

```

## rabbitmq

https://www.rabbitmq.com/production-checklist.html

https://cloud.google.com/kubernetes-engine/docs/concepts/cluster-autoscaler#autoscaling_profiles

https://github.com/kubernetes/autoscaler/blob/master/cluster-autoscaler/FAQ.md#how-can-i-check-what-is-going-on-in-ca-

https://github.com/rabbitmq/cluster-operator/blob/main/docs/examples/resource-limits/rabbitmq.yaml

https://www.rabbitmq.com/kubernetes/operator/kubectl-plugin.html

### Clients Libraries and Developer Tools

https://www.rabbitmq.com/devtools.html

amqp 1.0

- https://github.com/amqp/rhea

### yaml config

https://kubernetes.io/docs/tasks/configure-pod-container/assign-memory-resource/

```yaml title="rabbitmq.yml"
apiVersion: rabbitmq.com/v1beta1
kind: RabbitmqCluster
metadata:
  name: rabbit
spec:
  replicas: 1
  resources:
    requests:
      cpu: 500m
      memory: 1Gi
    limits:
      cpu: 800m
      memory: 1Gi
```

apply the config

```sh
kubectl apply -f infra/rabbit/rabbitmq.yml
```

check

```sh
fahmad@ryzen ticketing-rabbitmq]$  kubectl get pods
NAME              READY   STATUS    RESTARTS   AGE
rabbit-server-0   1/1     Running   0          15m
[fahmad@ryzen ticketing-rabbitmq]$  kubectl get services
NAME           TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)                        AGE
kubernetes     ClusterIP   10.96.0.1       <none>        443/TCP                        37d
rabbit         ClusterIP   10.110.18.122   <none>        5672/TCP,15672/TCP,15692/TCP   15m
rabbit-nodes   ClusterIP   None            <none>        4369/TCP,25672/TCP             15m

```

port forwarding

```sh
kubectl port-forward rabbit-server-0 5672:5672
```

get default username and password

```sh
username="$(kubectl get secret rabbit-default-user -o jsonpath='{.data.username}' | base64 --decode)"
echo $username

password="$(kubectl get secret rabbit-default-user -o jsonpath='{.data.password}' | base64 --decode)"
echo $password
```

### notes

In order to make sure a message is never lost, RabbitMQ supports [message acknowledgments](https://www.rabbitmq.com/confirms.html). An ack(nowledgement) is sent back by the consumer to tell RabbitMQ that a particular message has been received, processed and that RabbitMQ is free to delete it.

## test

### work queues

Distributing tasks among workers

```sh
ts-node src/worker.js
```

```sh
ts-node src/worker.js
```

```sh
sh new-task.sh
```

### publish/subscribe

Sending messages to many consumers at once

```sh
ts-node src/receive_logs.js > logs_from_rabbit.log
```

```sh
ts-node src/receive_logs.js
```

```sh
sh emit-log.sh
```

### routing

Receiving messages selectively

```sh
ts-node src/receive_log_direct.ts warning error > logs_from_rabbit.log
```

```sh
ts-node src/receive_log_direct.ts info warning error
```

```sh
ts-node src/emit_log_direct.ts error "Run. Run. "
```

### topic

Receiving messages based on a pattern (topics)

Although using the direct exchange improved our system, it still has limitations - it can't do routing based on multiple criteria.

```sh
ts-node src/receive_log_topic.ts '#'
```

```sh
ts-node src/receive_log_topic.ts "kern.*"
```

```sh
ts-node src/receive_log_topic.ts '*.critical'
```

```sh
ts-node src/receive_log_topic.ts "kern.*"
```

```sh
s-node src/emit_log_topic.ts 'kern.critical' 'a critical kernel error'
```

### rpc

```sh
ts-node src/rpc_server.ts
 [x] Awaiting RPC requests
 [.] fib(30)
 [.] fib(30)
```

```sh
ts-node src/rpc_client.ts 30
 [x] Requesting fib(30)
 [.] Got 832040
```

## rabbit on app

```sh
kubectl create secret generic rabbit-user --from-literal RABBIT_USER=thepassword
secret/rabbit-user created

kubectl create secret generic rabbit-password --from-literal RABBIT_PASSWORD=thepassword
secret/rabbit-password created
```

inside `tickets.depl.yaml` add the following right before `- name: JWT_KEY`

```yaml
- name: RABBIT_USER
  valueFrom:
    secretKeyRef:
      name: rabbit-user
      key: RABBIT_USER
- name: RABBIT_PASSWORD
  valueFrom:
    secretKeyRef:
      name: rabbit-password
      key: RABBIT_PASSWORD
- name: RABBIT_URL
  value: "rabbit"
```

### test

```sh
skaffold dev
```

port-forward

```sh
kubectl port-forward rabbit-server-0 5672:5672
```

change dir to rabbit-test then run

```sh
ts-node src/emit_direct_new.ts
```

hit endpoint `https://ticketing.dev/api/tickets` with method `POST` and json body :

```json
{
  "title": "concert",
  "price": 500
}
```

result

```sh
[fahmad@ryzen rabbit-test] $ ts-node src/receive_direct-new.ts
 [*] Waiting for logs. To exit press CTRL+C
 [x] tickets: '{"id":"61a098920d5a50f6ddcfc4dd","title":"concert","price":500,"userId":"61a097c301126ea70bb547d4"}'
 [x] tickets: '{"id":"61a09c082f66716e91dde5fb","title":"concert","price":500,"userId":"61a09bfeadd1ec605b55f19b"}'
```

## errors

```shell
Error: Channel closed by server: 406 (PRECONDITION-FAILED) with message "PRECONDITION_FAILED - delivery acknowledgement on channel 1 timed out. Timeout value used: 1800000 ms. This timeout value can be configured, see consumers doc guide to learn more"
```

## optimistic concurrency control in mongoose

https://stackoverflow.com/a/69047822

https://mongoosejs.com/docs/guide.html#optimisticConcurrency

```typescript
const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Created,
    },
    expiresAt: {
      type: mongoose.Schema.Types.Date,
    },
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
    optimisticConcurrency: true,
  }
);
```

## Stripe

1. sign up
2. get secret key

```shell
kubectl create secret generic stripe-secret --from-literal STRIPE_KEY=sfsdfsdfsdf

```

check it out

```shell
kubectl get secrets
```

### charge

https://stripe.com/docs/api/charges/create

## npm update

https://github.com/npm/cli/issues/708#issuecomment-965430893

## don't cancel completed orders

Using Postman:

1.  Sign in with your user's credentials.

2.  Create a new ticket.

3.  Create an order for that ticket.

4.  Send payment for that order within 60 seconds of the initial order.

You should see some Skaffold output similar to below:

[tickets] Event published to subject ticket:created

[orders] Message received: ticket:created / orders-service

[orders] Event published to subject order:created

[tickets] Message received: order:created / tickets-service

[expiration] Message received: order:created / expiration-service

[payments] Message received: order:created / payments-service

[expiration] Waiting this many milliseconds to process the job: 59959

[tickets] Event published to subject ticket:updated

[orders] Message received: ticket:updated / orders-service

[orders] Message received: payment:created / orders-service

[payments] Event published to subject payment:created

[expiration] Event published to subject expiration:complete

[orders] Message received: expiration:complete / orders-service
