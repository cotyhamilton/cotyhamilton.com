# replicasets

use [deployments](./deployments.md) 🙂

## example

```yaml
# replicaset-definition.yaml
apiVersion: apps/v1
kind: ReplicaSet
metadata:
  name: nginx
  labels:
    app: nginx
    tier: web
spec:
  template:
    metadata:
      name: nginx
      labels:
        app: nginx
        tier: web
    containers:
      - image: nginx
        name: nginx
  replicas: 2
  selector:
    matchLabels:
      app: nginx
```

## commands

```sh
# get
kubectl get rs

# scale
kubectl scale --replicas 6 rs nginx
```
