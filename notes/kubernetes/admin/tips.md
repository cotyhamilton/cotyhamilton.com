# tips

https://kubernetes.io/docs/reference/kubectl/conventions/

https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands

First things

```sh
# configure autocomplete
source <(kubectl completion zsh)

# set an alias
alias k=kubectl
```

Get all api resources and shorthand notation

```sh
kubectl api-resources
```

## imperative interaction

Create an NGINX Pod

```sh
kubectl run nginx --image=nginx
```

Generate POD Manifest YAML file (-o yaml). Don’t create it (–dry-run)

```sh
kubectl run nginx --image=nginx --dry-run=client -o yaml
```

Create a deployment

```sh
kubectl create deployment --image=nginx nginx
```

Edit a deployment

```sh
kubectl edit deployment nginx
```

Scale a deployment

```sh
kubectl scale deployment nginx --replicas 5
```

Set image

```sh
kubectl set image deployment nginx nginx=nginx:alpine
```

Create a service

```sh
kubectl expose deployment nginx --port 80
```

Create pod and service

```sh
kubectl run nginx --image=nginx:alpine --port=80 --expose
```

Generate Deployment YAML file (-o yaml). Don’t create it (–dry-run)

```sh
kubectl create deployment --image=nginx nginx --dry-run=client -o yaml
```

Generate Deployment YAML file (-o yaml). Don’t create it (–dry-run) and save it to a file.

```sh
kubectl create deployment --image=nginx nginx --dry-run=client -o yaml > nginx-deployment.yaml
```

Make necessary changes to the file (for example, adding more replicas) and then create the deployment.

```sh
kubectl create -f nginx-deployment.yaml
```

OR

In k8s version 1.19+, we can specify the –replicas option to create a deployment with 4 replicas.

```sh
kubectl create deployment --image=nginx nginx --replicas=4 --dry-run=client -o yaml > nginx-deployment.yaml
```

## restore a persistent volume

- Ensure the pv has reclaim policy `Retain`
- Edit the pv, delete the claim `spec.claimRef`
- Edit or create a pvc, set `spec.volumeName` to the pv name

## local persistent volumes

> 🎉 supports RWX

- [storage class](https://kubernetes.io/docs/concepts/storage/storage-classes/#local)
- [volume](https://kubernetes.io/docs/concepts/storage/volumes/#local)

Limitations

- single node only (schedule pods on the same node)
- no dynamic provisioning, create the pv manually

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: local-storage
provisioner: kubernetes.io/no-provisioner
volumeBindingMode: WaitForFirstConsumer
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: foo-pvc
spec:
  storageClassName: local-storage
  volumeName: foo-pv
  accessModes:
    - ReadWriteMany
  resources:
    requests:
      storage: 1Gi
---
apiVersion: v1
kind: PersistentVolume
metadata:
  name: foo-pv
spec:
  capacity:
    storage: 1Gi
  volumeMode: Filesystem
  accessModes:
    - ReadWriteMany
  persistentVolumeReclaimPolicy: Delete
  storageClassName: local-storage
  local:
    path: /mnt/storage/foo-pv
  nodeAffinity: # affinity is required
    required:
      nodeSelectorTerms:
        - matchExpressions:
            - key: kubernetes.io/hostname
              operator: In
              values:
                - worker-01
```
