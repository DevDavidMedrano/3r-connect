import { FileCheck2, UploadCloud } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Chip, EncabezadoPagina, Fila, Tarjeta } from '../../components/cliente/Piezas'
import type { VarianteChip } from '../../components/cliente/Piezas'
import { useDatosCliente } from '../../components/cliente/useDatosCliente'
import { etiquetaDocumento } from '../../types/proceso'
import type { DocumentoExpediente, EstadoDocumento, OrigenDocumento } from '../../types/proceso'

const VARIANTE_POR_ESTADO_DOCUMENTO: Record<EstadoDocumento, VarianteChip> = {
  pendiente: 'espera',
  en_revision: 'accion',
  validado: 'exito',
  rechazado: 'alerta',
}

interface ColumnaDocumentosProps {
  titulo: string
  icono: LucideIcon
  documentos: readonly DocumentoExpediente[]
  vacioTexto: string
}

function ColumnaDocumentos({ titulo, icono, documentos, vacioTexto }: ColumnaDocumentosProps) {
  return (
    <Tarjeta>
      <h2 className="text-base font-bold text-texto">{titulo}</h2>
      {documentos.length === 0 ? (
        <p className="mt-2 text-sm text-texto-suave">{vacioTexto}</p>
      ) : (
        <div className="mt-2">
          {documentos.map((documento) => (
            <div key={documento.id}>
              <Fila
                icono={icono}
                titulo={documento.nombre}
                descripcion={documento.fechaActualizacion ? `Actualizado el ${documento.fechaActualizacion}` : undefined}
                meta={<Chip variante={VARIANTE_POR_ESTADO_DOCUMENTO[documento.estado]}>{etiquetaDocumento(documento.estado)}</Chip>}
              />
              {documento.estado === 'rechazado' && documento.motivoRechazo && (
                <p className="-mt-1 mb-2 rounded-3r-md bg-alerta/10 px-3.5 py-2 text-xs text-alerta">
                  Tu {documento.nombre.toLowerCase()} fue rechazado: {documento.motivoRechazo.toLowerCase()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </Tarjeta>
  )
}

function porOrigen(documentos: readonly DocumentoExpediente[], origen: OrigenDocumento): DocumentoExpediente[] {
  return documentos.filter((documento) => documento.origen === origen)
}

export default function DocumentosClientePage() {
  const { proceso } = useDatosCliente()

  return (
    <div className="space-y-6">
      <EncabezadoPagina titulo="Documentos" descripcion="Papelería de tu proceso, organizada por quién la aporta." />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <ColumnaDocumentos
          titulo="Los que debes subir"
          icono={UploadCloud}
          documentos={porOrigen(proceso.documentos, 'sube_cliente')}
          vacioTexto="No tienes documentos pendientes por subir."
        />
        <ColumnaDocumentos
          titulo="Los que recibiste"
          icono={FileCheck2}
          documentos={porOrigen(proceso.documentos, 'entrega_inmobiliaria')}
          vacioTexto="Todavía no recibes documentos de la inmobiliaria."
        />
      </div>
    </div>
  )
}
