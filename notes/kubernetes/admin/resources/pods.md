# pods

You can only edit the following values in a pod spec

```
spec.containers[*].image
spec.initContainers[*].image
spec.activeDeadlineSeconds
spec.tolerations
```

But you can edit any field in the pod template of a [deployment](./deployments.md)

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
      resources:
        requests:
          memory: "64Mi"
          cpu: "250m"
        limits:
          memory: "128Mi"
          cpu: "500m"
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
