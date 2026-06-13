const hostname = process.env.HOSTNAME ?? 'unknown'
const service = 'ksefast-backend'

function write(level: string, msg: string, meta: Record<string, unknown> = {}): void {
  process.stdout.write(
    JSON.stringify({ timestamp: new Date().toISOString(), level, service, hostname, msg, ...meta }) + '\n',
  )
}

const log = {
  info:  (msg: string, meta?: Record<string, unknown>) => write('info',  msg, meta),
  warn:  (msg: string, meta?: Record<string, unknown>) => write('warn',  msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => write('error', msg, meta),
}

export default log
