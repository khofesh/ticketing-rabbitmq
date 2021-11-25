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
kubectl apply -f infra/k8s/rabbitmq.yml
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
