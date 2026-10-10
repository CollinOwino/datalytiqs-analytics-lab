import type { ExecutionProvider } from './types'
import { MockExecutionProvider } from './providers/mock'
import { RemoteExecutionProvider } from './providers/remote'

let instance: ExecutionProvider | null = null

export function getExecutionProvider(): ExecutionProvider {
  if (instance) return instance

  const selected = process.env.EXECUTION_PROVIDER
  if (process.env.NODE_ENV === 'production' && selected !== 'remote') {
    throw new Error('Production Python execution requires a configured remote sandbox.')
  }

  switch (selected || 'mock') {
    case 'mock':
      instance = new MockExecutionProvider()
      break
    case 'remote': {
      const baseUrl = process.env.SANDBOX_API_URL
      const token = process.env.SANDBOX_API_TOKEN
      if (!baseUrl || !token) {
        throw new Error('SANDBOX_API_URL and SANDBOX_API_TOKEN are required for remote execution.')
      }
      const endpoint = new URL(baseUrl)
      if (process.env.NODE_ENV === 'production' && endpoint.protocol !== 'https:') {
        throw new Error('Production sandbox endpoint must use HTTPS.')
      }
      instance = new RemoteExecutionProvider({ baseUrl: endpoint.toString().replace(/\/$/, ''), token })
      break
    }
    default:
      throw new Error(`Unsupported EXECUTION_PROVIDER: ${selected}`)
  }
  return instance
}
