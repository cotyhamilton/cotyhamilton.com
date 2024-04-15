# namespaces

## example

```yaml
# namespace-definition.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: dev
```

## commands

```sh
# specify namespace in commands
kubectl get certificates -n web

# get resources in all namespaces
kubectl get pods -A

# set namespace in current context
kubectl config set-context --current --namespace web

# imperative
kubectl create ns web
```
