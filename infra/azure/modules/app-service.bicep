@description('Base name for resources')
param baseName string

@description('Location')
param location string

@description('Database connection string')
param databaseUrl string

@description('Key Vault name')
param keyVaultName string

resource appServicePlan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name: 'plan-${baseName}'
  location: location
  sku: {
    name: 'B1'
    tier: 'Basic'
  }
  kind: 'linux'
  properties: {
    reserved: true
  }
}

resource appService 'Microsoft.Web/sites@2023-12-01' = {
  name: 'app-${baseName}-backend'
  location: location
  kind: 'app,linux'
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      linuxFxVersion: 'NODE|20-lts'
      appSettings: [
        { name: 'DATABASE_URL', value: databaseUrl }
        { name: 'NODE_ENV', value: 'production' }
        { name: 'PORT', value: '3001' }
      ]
    }
    httpsOnly: true
  }
}

output url string = 'https://${appService.properties.defaultHostName}'
output name string = appService.name
