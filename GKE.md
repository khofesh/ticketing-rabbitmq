# Deploy to GKE

## gcloud error

```shell
[fahmad@ryzen ticketing-rabbitmq]$ gcloud container clusters get-credentials cluster-name
ERROR: gcloud crashed (SystemError): ffi_prep_closure(): bad user_data (it seems that the version of the libffi library seen at runtime is different from the 'ffi.h' file seen at compile-time)

If you would like to report this issue, please run the following command:
  gcloud feedback

To check gcloud for common problems, please run the following command:
  gcloud info --run-diagnostics

```

install python3.9

```shell
sudo dnf install python3.9
```

prepend `CLOUDSDK_PYTHON=python3.9` in every gcloud command

```shell
CLOUDSDK_PYTHON=python3.9 gcloud config set compute/zone asia-southeast1-a
```

## get credentials

```shell
CLOUDSDK_PYTHON=python3.9 gcloud container clusters get-credentials cluster-name --region asia-southeast1 --project trial-aab-gcp
```

## apply rabbitmq

```shell
kubectl apply -f infra/rabbit/rabbitmq.yml
```

`watch kubectl get all`

```shell
Every 2.0s: kubectl get all                                                             ryzen: Tue Dec 14 16:56:13 2021

NAME                  READY   STATUS    RESTARTS   AGE
pod/rabbit-server-0   1/1     Running   0          4m15s

NAME                   TYPE        CLUSTER-IP	   EXTERNAL-IP   PORT(S)                        AGE
service/kubernetes     ClusterIP   10.92.128.1     <none>        443/TCP                        19d
service/rabbit         ClusterIP   10.92.128.230   <none>        5672/TCP,15672/TCP,15692/TCP   4m16s
service/rabbit-nodes   ClusterIP   None            <none>        4369/TCP,25672/TCP             4m17s

NAME                             READY   AGE
statefulset.apps/rabbit-server   1/1     4m16s

NAME                                  ALLREPLICASREADY   RECONCILESUCCESS   AGE
rabbitmqcluster.rabbitmq.com/rabbit   True               True               4m17s

```

## secrets

### rabbitmq secret key

get rabbitmq`s username and password

```shell
username="$(kubectl get secret rabbit-default-user -o jsonpath='{.data.username}' | base64 --decode)"
echo $username

password="$(kubectl get secret rabbit-default-user -o jsonpath='{.data.password}' | base64 --decode)"
echo $password
```

set secrets

```shell
kubectl create secret generic rabbit-user --from-literal RABBIT_USER=theUserName

kubectl create secret generic rabbit-password --from-literal RABBIT_PASSWORD=thePassword
```

### stripe secret key

```shell
kubectl create secret generic stripe-secret --from-literal STRIPE_KEY=theSecret
```

### jwt secret key

```shell
kubectl create secret generic jwt-secret --from-literal JWT_KEY=39obgzV0KXKYpXTiG05KvPeoR
```

## apply

```shell
kubectl apply -f infra/gke/
```

### Notes

http://g.co/gke/autopilot-resources

```sh
Warning: Autopilot increased resource requests for Deployment default/client-depl to meet requirements. See http://g.co/gke/autopilot-resources.
```

## Ingress

open google shell

```shell
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm install my-release ingress-nginx/ingress-nginx
```

**wait for several minutes**

apply ingress config

```shell
kubectl apply -f infra/k8s-prod/
```

## restart a deployment

```shell
kubectl rollout restart deployment client-depl
```
