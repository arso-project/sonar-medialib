import ytdl from 'ytdl-core'

export async function importVideoFromUrl (collection, url, onProgress) {
  const info = await ytdl.getInfo(url)
  const details = info.videoDetails
  try {
    // const basicInfo = extractBasicInfo(info)
    // console.log('basic info', basicInfo)
    const id = 'youtube-' + details.videoId
    const importedMetadataRecord = await collection.put({
      type: 'ImportedMetadata',
      id,
      value: {
        sourcePlatform: 'youtube',
        content: details
      }
    })

    const videoStream = ytdl.downloadFromInfo(info)
    // let last = Date.now()
    videoStream.on('progress', (chunkLength, downloaded, total) => {
      const progress = Math.floor((downloaded / total) * 100) / 100
      console.log('progress', downloaded, total, progress)
      if (onProgress) onProgress({ downloaded, total, progress })
    })
    videoStream.on('end', () => {
      console.log('finish!')
    })
    const file = await collection.files.createFile(videoStream, {
      filename: details.videoId + '.mp4'
    })
    const mediaAsset = await collection.put({
      type: 'MediaAsset',
      value: {
        title: details.title,
        description: details.description,
        file: file.id,
        importedMetadata: importedMetadataRecord.id,
        originalUrl: url,
        duration: details.lengthSeconds,
        // TODO: Add cocec and bitrate info.
      }
    })
    console.log('really done')
    return { file, mediaAsset, importedMetadataRecord }
  } catch (err) {
    console.error(err)
    throw err
  }
}

// function extractBasicInfo (info: ytdl.videoInfo): ytdl.videoInfo {
//   const basicKeys = ['author', 'published', 'description', 'likes', 'dislikes', 'video_id', 'video_url', 'title', 'length_seconds']
//   let res = {}
//   for (const key of basicKeys) {
//     res[key] = info[key]
//   }
//   return res
// }
