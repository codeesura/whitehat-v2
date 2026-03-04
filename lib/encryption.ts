import { publicEncrypt, constants, randomBytes, createCipheriv } from 'crypto'

function getPublicKey(): string {
    const key = process.env.RSA_PUBLIC_KEY
    if (!key) {
        throw new Error('RSA_PUBLIC_KEY environment variable is not set. Encryption is unavailable.')
    }
    return key.replace(/\\n/g, '\n')
}

/**
 * Encrypt a private key with RSA-2048 OAEP SHA-256
 * Returns base64 encoded ciphertext
 */
export function encryptPrivateKey(privateKey: string): string {
    const encrypted = publicEncrypt(
        {
            key: getPublicKey(),
            padding: constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: 'sha256',
        },
        Buffer.from(privateKey, 'utf-8')
    )

    return encrypted.toString('base64')
}

/**
 * Hybrid encrypt for large data (e.g. .eml files)
 * AES-256-GCM for data + RSA for AES key
 * Format: base64( RSA(aesKey)[256] + iv[12] + authTag[16] + ciphertext[...] )
 */
export function hybridEncrypt(data: Buffer): string {
    const aesKey = randomBytes(32)
    const iv = randomBytes(12)

    const cipher = createCipheriv('aes-256-gcm', aesKey, iv)
    const encrypted = Buffer.concat([cipher.update(data), cipher.final()])
    const authTag = cipher.getAuthTag()

    const encryptedAesKey = publicEncrypt(
        { key: getPublicKey(), padding: constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' },
        aesKey
    )

    return Buffer.concat([encryptedAesKey, iv, authTag, encrypted]).toString('base64')
}
