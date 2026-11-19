const allowedOrigins = new Set([
    'https://health-mate-g1l2.vercel.app',
    'https://health-mate-rpic.vercel.app',
    'http://localhost:3001',
])

const healthMatePreviewOrigin = /^https:\/\/health-mate-[a-z0-9-]+-ansharahamins-projects\.vercel\.app$/

export function isAllowedCorsOrigin(origin) {
    return allowedOrigins.has(origin) || healthMatePreviewOrigin.test(origin)
}
