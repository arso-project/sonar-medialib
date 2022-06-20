import ytdl from 'ytdl-core'
import fs from 'fs/promises'
import { file as createTempFile } from 'tmp-promise'
import { Readable, pipeline } from 'node:stream'
import { spawn } from 'node:child_process'
import ffprobeStatic from 'ffprobe-static'
import type { Collection } from '@arsonar/client'
import { openCollection } from '../sonar.server.js'

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
      duration: details.lengthSeconds
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

interface UploadFileProps {
  contentType: string
  data: AsyncIterable<Uint8Array>
  filename: string | undefined
}

export async function importVideoFromStream (collection: Collection, data: AsyncIterable<Uint8Array>, filename?: string, contentType?: string) {
  const file = await collection.files.createFile(data, {
    filename,
    contentType
  })
  const info = await ffprobeFile(collection, file.id)
  const stream = info.streams[0]
  const mediaAssetValue = {
    title: info.format?.tags?.title,
    file: file.id,
    ffprobeInfo: info,
    duration: stream?.duration
    // importedMetadata: importedMetadataRecord.id,
    // originalUrl: url,
    // description: details.description,
  }
  const mediaAsset = await collection.put({
    type: 'MediaAsset',
    value: mediaAssetValue
  })
  return { file, mediaAsset }
}

export async function ffprobeFile (collection: Collection, id: string): Promise<any> {
  const body = await collection.files.readFile(id)
  const stream = Readable.from(body)

  const info = await ffprobeStream(stream)
  return info
}

export async function ffprobeStream (stream: Readable) {
  const { path: tempfile, cleanup } = await createTempFile()
  await fs.writeFile(tempfile, stream)

  const args = [
    '-show_streams',
    '-show_entries',
    'format_tags',
    '-print_format',
    'json',
    '-i',
    tempfile
  ]
  const ffprobe = spawn(ffprobeStatic.path, args, {
    stdio: 'pipe'
  })
  let buf = ''
  ffprobe.stdout.on('data', chunk => {
    buf += chunk.toString()
  })
  stream.pipe(ffprobe.stdin)
  // ignore ffprobe errors.
  ffprobe.stdin.on('error', _err => {})
  await new Promise((resolve, _reject) => {
    ffprobe.stdout.on('end', resolve)
  })
  const info = JSON.parse(buf)
  await cleanup()
  return info
}

export async function uploadFileToSonar ({
  contentType,
  data,
  filename
}: UploadFileProps) {
  const collection = await openCollection()
  let fileRecord
  try {
    fileRecord = await collection.files.createFile(data, {
      filename,
      contentType
    })
  } catch (err: any) {
    return { error: err }
  }
  return fileRecord.id
}
