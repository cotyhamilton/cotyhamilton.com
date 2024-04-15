# pods

## example

```yaml
# pod-definition.yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx
  labels:
    app: nginx
    tier: web
spec:
  containers:
    - image: nginx
      name: nginx
      ports:
        - containerPort: 80
          name: web # use in service instead of number
```

## commands

```sh
# get
kubectl get pods

# imperative
kubectl run nginx --image nginx

# generate spec
kubectl run nginx --image nginx -o yaml --dry-run=client > pod.yaml
```
