import type { AIProvider } from "./ai-provider.interface"
import { NvidiaProvider } from "./nvidia.provider"

export function getAIProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER?.toLowerCase()
  switch (provider) {
    case "nvidia":
    default:
      return new NvidiaProvider()
  }
}

