# taints and tolerations

## taints

Taints are applied to nodes.

There are 3 taint effects

- NoSchedule
- PreferNoSchedule
- NoExecute

```sh
# syntax
kubectl taint nodes <node-name> key=value:taint-effect

# dont schedule new pods on that don't tolerate app=web taint
kubectl taint nodes worker-80085 app=web:NoSchedule

# view taints on a node
kubectl describe node worker-80085
```

> ✋ Taints are typically applied master nodes to prevent pods from being scheduled on them.

## tolerations

Tolerations are applied to pods by adding a `tolerations` object in the pod spec.

> ✋ Tolerations don't guarantee that a pod will be scheduled on a node with the corresponding taint

This pod is able to scheduled on the node with the taint `app=web:NoSchedule`

```yaml
# pod-definition.yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx
spec:
  containers:
    - name: nginx-container
      image: nginx
  tolerations:
    - key: app
      operator: Equal
      value: web
      effect: NoSchedule
```
