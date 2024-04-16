# scheduling

## labels and selectors

```yaml
# pod-definition.yaml
apiVersion: v1
 kind: Pod
 metadata:
  name: simple-webapp
  labels:
    tier: web
 spec:
  containers:
  - name: simple-webapp
    image: simple-webapp
    ports:
    - containerPort: 8080
```

Get resources with labels

```sh
# get pods
kubectl get pods --selector tier=web

# get all
kubectl get all -l tier=web

# count the number of pods with tier=web label
kubectl get pods -l tier=web --no-headers | wc -l

# get pods with multiple labels
k get pod -l tier=web,app=nginx
```

Use selectors, match labels to the pods in the template

```yaml
# deployment-definition.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx
  labels:
    app: nginx
    tier: web
spec:
  selector:
    matchLabels:
      app: nginx # matches label in the template below
  template:
    metadata:
      name: nginx
      labels:
        app: nginx # !
        tier: web
    containers:
      - image: nginx
        name: nginx
  replicas: 2
```

Use selectors in services to expose pods

```yaml
# service-definition.yaml
apiVersion: v1
kind: Service
metadata:
  name: web-service
  labels:
    app: web-service
spec:
  type: ClusterIP
  ports:
    - port: 80
      targetPort: 80
      protocol: TCP
  selector:
    app: web-service # this selector targets the pod with this label
```

## manual scheduling

Set `nodeName` in the pod spec at creation time only

```yaml
# pod-definition.yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx
spec:
  containers:
    - image: nginx
      name: nginx
  nodeName: worker-80085
```

To schedule a running pod, create a `Binding` object and send to the binding api

```yaml
# binding-definition.yaml
apiVersion: v1
kind: Binding
metadata:
  name: nginx
target:
  apiVersion: v1
  kind: Node
  name: worker-80085
```

## [taints and tolerations](./taints-tolerations.md)

Taints and tolerations describe rules that set restrictions on which nodes can schedule with pods.

Use cases:

- node affinity
- node maintenance
- specialized hardware

## node selectors

```sh
# label a node with size=bb
kubectl label nodes worker-80085 size=bb
```

Schedule a pod on the node with selector `size=bb`

```yaml
# pod-definition.yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx
spec:
  containers:
    - image: nginx
      name: nginx
  nodeSelector:
    size: bb
```

> ✋ node selectors are limited, see node affinity

## node affinity

Like `nodeSelector` but can handle logical conditions in expressions.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx
spec:
  containers:
    - name: nginx
      image: nginx
  affinity:
    nodeAffinity:
      # preferredDuringSchedulingIgnoredDuringExecution:
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
          - matchExpressions:
              - key: size
                operator: In
                values:
                  - bb
                  - c
```

> ✋ use taints and tolerations along with node affinity and selectors to ensure nodes **only** schedule **specific** pods, and pods are **only** scheduled to **certain** nodes

## resource limits

Request and limit compute

### container spec

```yaml
# pod-definition.yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx
spec:
  containers:
    - name: nginx
      image: nginx
      resources:
        requests:
          memory: "64Mi"
          cpu: "250m"
        limits:
          memory: "128Mi"
          cpu: "500m"
```

### limit ranges

todo

### resource quotas

todo

## daemon sets

Similar to ReplicaSet but runs a pod on each node

```sh
# daemonset-definition.yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: monitoring
spec:
  template:
    metadata:
      name: monitoring
      labels:
        app: monitoring
    containers:
      - image: agent
        name: agent
  selector:
    matchLabels:
      app: monitoring
```

Use cases

- monitoring and logging agents
- kube-proxy

## static pods

The kubelet can schedule pods without the kube-apiserver by placing pod definitions in a specific directory. This is useful for bootstrapping control plane components as containers.

Check the `/etc/kubernetes/manifests/` directory and/or the `staticPodPath` field in the kublet config file at `/var/lib/kubelet/config.yaml` (probably).

Web-hosted static pod manifests are also a thing, configured with the kubelet arg `--manifest-url=<manifest-url>`.

## todo

### multiple schedulers

### scheduler plugins
