@description('Base name for resources')
param baseName string

@description('Location')
param location string

@description('Backend URL for API proxy')
param backendUrl string

resource staticWebApp 'Microsoft.Web/staticSites@2023-12-01' = {
  name: 'swa-${baseName}'
  location: location
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {
    buildProperties: {
      appLocation: 'frontend'
      outputLocation: 'dist'
    }
  }
}

output url string = 'https://${staticWebApp.properties.defaultHostname}'
output name string = staticWebApp.name
