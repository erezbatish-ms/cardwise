@description('Base name for resources')
param baseName string

@description('Location')
param location string

resource postgresServer 'Microsoft.DBforPostgreSQL/flexibleServers@2023-12-01-preview' = {
  name: 'psql-${baseName}'
  location: location
  sku: {
    name: 'Standard_B1ms'
    tier: 'Burstable'
  }
  properties: {
    version: '16'
    storage: {
      storageSizeGB: 32
    }
    backup: {
      backupRetentionDays: 7
      geoRedundantBackup: 'Disabled'
    }
    highAvailability: {
      mode: 'Disabled'
    }
    authConfig: {
      activeDirectoryAuth: 'Enabled'
      passwordAuth: 'Enabled'
    }
  }
}

resource database 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2023-12-01-preview' = {
  parent: postgresServer
  name: baseName
  properties: {
    charset: 'UTF8'
    collation: 'en_US.utf8'
  }
}

output connectionString string = 'postgresql://${postgresServer.name}.postgres.database.azure.com:5432/${baseName}?sslmode=require'
output serverName string = postgresServer.name
