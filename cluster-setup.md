# 🚢 Kubernetes Cluster Setup

## ingress

```sh
helm upgrade --install ingress-nginx ingress-nginx \
  --repo https://kubernetes.github.io/ingress-nginx \
  --namespace ingress-nginx --create-namespace
```

https://kubernetes.github.io/ingress-nginx/deploy/#quick-start

## certificates

### cert manager

```sh
helm repo add jetstack https://charts.jetstack.io
helm repo update

# install CRDs
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.14.4/cert-manager.crds.yaml

# install cert manager
helm install \
  cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --version <v1.14.4 | latest>
```

https://cert-manager.io/docs/installation/helm/

### cluster issuers

HTTP-01 challenges

```sh
cat << EOF | kubectl create -n cert-manager -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-staging
spec:
  acme:
    email: your@email.com
    server: https://acme-staging-v02.api.letsencrypt.org/directory
    privateKeySecretRef:
      name: letsencrypt-staging
    solvers:
      - http01:
          ingress:
            class: nginx
---
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    email: your@email.com
    server: https://acme-v02.api.letsencrypt.org/directory
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
      - http01:
          ingress:
            class: nginx
EOF
```

https://cert-manager.io/docs/configuration/acme/http01/

DNS-01 challenges for wildcard certificates on digitalocean

```sh
cat << EOF | kubectl create -n cert-manager -f -
apiVersion: v1
kind: Secret
metadata:
  name: digitalocean-dns
  namespace: cert-manager
data:
  access-token: <base64 encoded token>
---
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-staging-wildcard
spec:
  acme:
    email: your@email.com
    server: https://acme-staging-v02.api.letsencrypt.org/directory
    privateKeySecretRef:
      name: letsencrypt-staging-wildcard
    solvers:
      - dns01:
          digitalocean:
            tokenSecretRef:
              name: digitalocean-dns
              key: access-token
---
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod-wildcard
spec:
  acme:
    email: your@email.com
    server: https://acme-v02.api.letsencrypt.org/directory
    privateKeySecretRef:
      name: letsencrypt-prod-wildcard
    solvers:
      - dns01:
          digitalocean:
            tokenSecretRef:
              name: digitalocean-dns
              key: access-token
EOF
```

https://cert-manager.io/docs/configuration/acme/dns01/digitalocean/

### usage

To create and use a wildcard cert

```sh
# certificate

cat << EOF | kubectl create -n cert-manager -f -
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: example.com-tls
spec:
  secretName: example.com-tls
  issuerRef:
    kind: ClusterIssuer
    name: letsencrypt-staging-wildcard
  commonName: "*.example.com"
  dnsNames:
    - "*.example.com"
EOF

# ingress

cat << EOF | kubectl create -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: example
spec:
  ingressClassName: nginx
  rules:
    - host: "*.example.com"
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: example
                port:
                  number: 80
  tls:
    - hosts:
        - "*.example.com"
      secretName: "example.com-tls"
EOF
```

> ✋ change cluster-issuer to letsencrypt-prod-wildcard for trusted cert

To have ingress and cert-manager implicitly create and use a certificate for a domain

```sh
cat << EOF | kubectl create -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: hello
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-staging"
spec:
  ingressClassName: nginx
  rules:
    - host: "hello.example.com"
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: hello
                port:
                  number: 80
  tls:
    - hosts:
        - "hello.example.com"
      secretName: "hello.example.com-tls"
EOF
```

> ✋ change cluster-issuer to letsencrypt-prod for trusted cert
