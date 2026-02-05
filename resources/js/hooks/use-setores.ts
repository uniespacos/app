import { useState } from "react"
import { Setor } from "@/types"

export function useSetores(listSetores: Setor[] = []) {
  const [setores] = useState<Setor[]>(listSetores)

  
  return {
    setores,
  }
}
