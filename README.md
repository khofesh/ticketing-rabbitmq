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
