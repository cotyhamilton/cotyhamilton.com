# logging and monitoring

## metrics server

In-memory monitoring only, no historical data.

https://github.com/kubernetes-sigs/metrics-server

```sh
# metrics for nodes
kubectl top node

# metrics for a specific pod
kubectl top pod/<pod>
```

## logs

```sh
# follow logs for a pod that has multiple containers
kubectl logs -f pod <pod> <container>
```
