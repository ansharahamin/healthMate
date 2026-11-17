import ImageKit from "@imagekit/nodejs";
import 'dotenv/config'
import path from "path";
import { randomUUID } from "crypto";
const client = new ImageKit({
    privateKey:process.env.IMAGEKIT_PRIVATE_KEY
})

export async function uploadHealthRecordFile(buffer, originalname, mimeType) {
    const extension = path.extname(originalname).toLowerCase()
    const response = await client.files.upload({
        file: buffer.toString('base64'),
        fileName: `${randomUUID()}${extension}`,
        folder: 'health-records',
        isPrivateFile: true,
    })

    if (!response.fileId || !response.filePath || !response.url) {
        throw new Error('ImageKit did not return the required health file details.')
    }

    const uploadedUrl = new URL(response.url)
    const filePath = response.filePath.startsWith('/') ? response.filePath : `/${response.filePath}`
    if (!uploadedUrl.pathname.endsWith(filePath)) {
        throw new Error('ImageKit returned an unexpected health file URL.')
    }
    const urlEndpoint = `${uploadedUrl.origin}${uploadedUrl.pathname.slice(0, -filePath.length)}`

    return {
        fileId: response.fileId,
        filePath,
        fileUrl: response.url,
        mimeType,
        urlEndpoint,
    }
}

export async function deleteHealthRecordFile(fileId) {
    await client.files.delete(fileId)
}

export function createHealthRecordDownloadUrl(file) {
    return client.helper.buildSrc({
        urlEndpoint: file.urlEndpoint,
        src: file.filePath,
        expiresIn: 300,
    })
}