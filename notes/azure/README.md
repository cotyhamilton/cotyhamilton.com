---
icon: ☁️
title: ☁️ azure
---

# azure

## service principals

```sh
# create a service principal
az ad sp create-for-rbac -n <name> --role Contributor --scopes /subscriptions/<subscription id>/resourceGroups/<resource group> --query "{ client_id: appId, client_secret: password, tenant_id: tenant }"

# add another scope to the service principal because you forgot above
az role assignment create --assignee-object-id <object id> --role Contributor --scope /subscriptions/<subscription id>/resourceGroups/<resource group>
```