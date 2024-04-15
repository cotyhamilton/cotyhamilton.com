# components

## control plane components

The control plane's components make global decisions about the cluster, as well as detecting and responding to cluster events.Control plane components can be run on any machine in the cluster.

### kube-apiserver

Kube-apiserver is the front end for the Kubernetes control plane. It exposes the Kubernetes API, allowing users, administrators, and controllers to interact with the cluster. It validates and processes API requests, performs authentication and authorization, and serves as the entry point for all administrative tasks.

### etcd

Etcd is a distributed key-value store that stores the cluster's configuration data, state information, and metadata. It ensures consistency, fault tolerance, and high availability for the Kubernetes control plane.

### kube-scheduler

Kube-scheduler is responsible for scheduling pods onto nodes in the cluster. It considers factors like resource availability, node constraints, and scheduling policies to determine the best node for each pod. It aims to optimize resource utilization, improve fault tolerance, and maintain high availability for applications.

### kube-controller-manager

Kube-controller-manager hosts various controllers responsible for regulating the state of the cluster. It includes controllers such as node, replication, endpoint, service account, and namespace controllers. These controllers continuously watch the Kubernetes API server for changes and take action to maintain the desired state of the cluster.

## node components

Node components run on every node, maintaining running pods and providing the Kubernetes runtime environment.

### kubelet

Kubelet is an agent that runs on each node in the cluster and is responsible for managing the pods and containers running on that node. It communicates with the Kubernetes API server to receive instructions, manages pod lifecycle operations (such as starting, stopping, and monitoring), and reports node status back to the control plane.

### kube-proxy

Kube-proxy is a network proxy that runs on each node in the cluster and is responsible for implementing Kubernetes service abstraction. It maintains network rules on nodes to enable communication between pods and services within the cluster. It supports various networking modes, including user-space, iptables, and IPVS, to provide scalable and efficient service discovery and load balancing.
