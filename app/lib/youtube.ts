import ytdl from 'ytdl-core'
import type { Collection } from '@arsonar/client'

export type YoutubeImportOpts = {
  onProgress: (progress: { progress: number, downloaded?: number, total?: number }) => void | Promise<void>
}

export async function importVideoFromUrlMock (_collection: Collection, _url: String, { onProgress }: YoutubeImportOpts) {
  let progress = 0
  while (progress < 1) {
    await new Promise(resolve => setTimeout(resolve, 20))
    onProgress({ progress })
    progress += 0.01
  }
  return { mediaAsset: { id: 'foo' } }
}

export async function importVideoFromUrl (collection: Collection, url: string, { onProgress }: YoutubeImportOpts) {
  const info = await ytdl.getInfo(url)
  const details = info.videoDetails
  try {
    const id = 'youtube-' + details.videoId
    const importedMetadataRecord = await collection.put({
      type: 'ImportedMetadata',
      id,
      value: {
        sourcePlatform: 'youtube.com',
        content: details
      }
    })

    const videoStream = ytdl.downloadFromInfo(info)
    videoStream.on('progress', (_chunkLength, downloaded, total) => {
      const progress = Math.floor((downloaded / total) * 100) / 100
      if (onProgress) onProgress({ downloaded, total, progress })
    })
    const file = await collection.files.createFile(videoStream, {
      filename: details.videoId + '.mp4'
    })
    const mediaAssetValue = {
      title: details.title,
      description: details.description,
      file: file.id,
      importedMetadata: importedMetadataRecord.id,
      originalUrl: url,
      duration: details.lengthSeconds,
    }
    const mediaAsset = await collection.put({
      type: 'MediaAsset',
      value: mediaAssetValue
    })
    return { file, mediaAsset, importedMetadataRecord }
  } catch (err) {
    throw err
  }
}
