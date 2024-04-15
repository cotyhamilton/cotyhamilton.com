# deployments

## example

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
kubectl get deploy

# scale
kubectl scale --replicas 6 deploy nginx

# redeploy
kubectl rollout restart deploy nginx

# imperative
kubectl create deployment --image=nginx nginx

# generate spec
kubectl create deployment --image=nginx nginx --dry-run=client -o yaml > deployment.yaml
```
