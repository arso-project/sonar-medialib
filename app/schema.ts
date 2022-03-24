export const schema = {
  defaultNamespace: 'sonar-medialib',
  types: {
    AboutMe: {
      fields: {
        name: {
          type: 'string'
        }
      }
    },
    ImportedMetadata: {
      title: 'Imported metadata',
      fields: {
        sourcePlatform: {
          type: 'string'
        },
        content: {
          type: 'object'
        }
      }
    },
    MediaAsset: {
      title: 'Media asset',
      fields: {
        title: {
          type: 'string'
        },
        description: {
          type: 'string'
        },
        file: {
          type: 'relation',
        },
        importedMetadata: {
          type: 'relation'
        },
        originalUrl: {
          type: 'string'
        },
        duration: {
          type: 'number',
          title: 'Duration',
          description: 'Duration in seconds'
        },
        codec: {
          type: 'string'
        },
        bitrate: {
          type: 'number'
        }
      }
    }
  }
}
