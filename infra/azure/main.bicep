targetScope = 'resourceGroup'

@description('Base name for all resources')
param baseName string = 'cardwise'

@description('Location for resources')
param location string = resourceGroup().location

@description('Azure OpenAI model deployment name')
param openAiDeployment string = 'gpt-4o'

@description('App password (stored in Key Vault)')
@secure()
param appPassword string

// Modules
module postgresql 'modules/postgresql.bicep' = {
  name: 'postgresql'
  params: {
    baseName: baseName
    location: location
  }
}

module appService 'modules/app-service.bicep' = {
  name: 'appService'
  params: {
    baseName: baseName
    location: location
    databaseUrl: postgresql.outputs.connectionString
    keyVaultName: keyvault.outputs.name
  }
}

module staticWebApp 'modules/static-web-app.bicep' = {
  name: 'staticWebApp'
  params: {
    baseName: baseName
    location: location
    backendUrl: appService.outputs.url
  }
}

module openai 'modules/openai.bicep' = {
  name: 'openai'
  params: {
    baseName: baseName
    location: location
    deploymentName: openAiDeployment
  }
}

module keyvault 'modules/keyvault.bicep' = {
  name: 'keyvault'
  params: {
    baseName: baseName
    location: location
    appPassword: appPassword
    openAiKey: openai.outputs.apiKey
    databaseUrl: postgresql.outputs.connectionString
  }
}

// Outputs
output backendUrl string = appService.outputs.url
output frontendUrl string = staticWebApp.outputs.url
output keyVaultName string = keyvault.outputs.name
