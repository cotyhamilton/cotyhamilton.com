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

## resource limits

## daemon sets

## multiple schedulers

## scheduler events

## configuration
