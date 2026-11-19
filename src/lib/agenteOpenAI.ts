import type { Asesor } from '../types/asesor'
import type { Propiedad } from '../types/propiedad'
import { construirMensajeSistema, type ContextoUsuarioAgente } from './agenteContexto'

// PUNTO DE INTEGRACIÓN — DEMO ONLY. VITE_OPENAI_API_KEY viaja dentro del
// bundle del navegador: cualquiera que abra las herramientas de
// desarrollo puede leerla. Sirve para hacer la demo local, nunca para
// producción. Antes de publicar, esta es la ÚNICA función que hay que
// tocar: cambia el cuerpo para llamar a un endpoint propio (backend) que
// guarde la llave del lado del servidor — la firma (recibe historial +
// propiedad + asesor, regresa el texto de la respuesta) no debería
// cambiar.
export interface TurnoConversacion {
  rol: 'user' | 'assistant'
  contenido: string
}

const MODELO = 'gpt-4o-mini'

interface RespuestaChatCompletions {
  choices?: { message?: { content?: string } }[]
}

export async function pedirRespuestaAgente(
  historial: TurnoConversacion[],
  propiedad: Propiedad,
  asesor: Asesor,
  contextoUsuario: ContextoUsuarioAgente | null = null,
): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('Sin VITE_OPENAI_API_KEY configurada')
  }

  const respuesta = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODELO,
      temperature: 0.6,
      max_tokens: 130,
      messages: [
        { role: 'system', content: construirMensajeSistema(propiedad, asesor, contextoUsuario) },
        ...historial.map((turno) => ({ role: turno.rol, content: turno.contenido })),
      ],
    }),
  })

  if (!respuesta.ok) {
    throw new Error(`OpenAI respondió ${respuesta.status}`)
  }

  const datos = (await respuesta.json()) as RespuestaChatCompletions
  const texto = datos.choices?.[0]?.message?.content
  if (typeof texto !== 'string' || !texto.trim()) {
    throw new Error('Respuesta de OpenAI sin contenido')
  }
  return texto.trim()
}
