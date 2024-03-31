# 🌩️ azure devops

## azure cli and terraform pipeline

```yml
pool:
  vmImage: ubuntu-latest

steps:
  - task: AzureCLI@2
    inputs:
      azureSubscription: <subscription>
      scriptType: "bash"
      scriptLocation: "inlineScript"
      inlineScript: |
        echo "##vso[task.setvariable variable=AZURE_CLIENT_ID;]$servicePrincipalId"
        echo "##vso[task.setvariable variable=AZURE_CLIENT_SECRET;issecret=true]$servicePrincipalKey"
        echo "##vso[task.setvariable variable=AZURE_TENANT_ID;]$tenantId"
      addSpnToEnvironment: true
    displayName: AZ Login

  - script: |
      terraform init
    env:
      ARM_CLIENT_ID: $(AZURE_CLIENT_ID)
      ARM_CLIENT_SECRET: $(AZURE_CLIENT_SECRET)
      ARM_TENANT_ID: $(AZURE_TENANT_ID)
      ARM_SUBSCRIPTION_ID: <subscription>
    displayName: Terraform
```
