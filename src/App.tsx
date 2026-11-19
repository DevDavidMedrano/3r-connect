import { Navigate, Route, Routes } from 'react-router-dom'
import { LayoutAdmin } from './components/admin/LayoutAdmin'
import { LayoutCliente } from './components/cliente/LayoutCliente'
import { SesionProvider } from './components/cuenta/SesionContext'
import AjustesGeneralesAdminPage from './pages/admin/AjustesGeneralesAdminPage'
import AsignacionAsesoresAdminPage from './pages/admin/AsignacionAsesoresAdminPage'
import AgendaAdminPage from './pages/admin/AgendaAdminPage'
import BitacoraAdminPage from './pages/admin/BitacoraAdminPage'
import CaptacionAdminPage from './pages/admin/CaptacionAdminPage'
import EstadisticasAdminPage from './pages/admin/EstadisticasAdminPage'
import ExportacionesAdminPage from './pages/admin/ExportacionesAdminPage'
import FinancieroAdminPage from './pages/admin/FinancieroAdminPage'
import InboxAdminPage from './pages/admin/InboxAdminPage'
import InventarioAdminPage from './pages/admin/InventarioAdminPage'
import NuevoProspectoCaptacionPage from './pages/admin/NuevoProspectoCaptacionPage'
import NuevoProspectoVentaPage from './pages/admin/NuevoProspectoVentaPage'
import NuevoUsuarioAdminPage from './pages/admin/NuevoUsuarioAdminPage'
import PlantillasDocumentosAdminPage from './pages/admin/PlantillasDocumentosAdminPage'
import ProductividadAdminPage from './pages/admin/ProductividadAdminPage'
import ProspectosCaptacionAdminPage from './pages/admin/ProspectosCaptacionAdminPage'
import ProspectosVentaAdminPage from './pages/admin/ProspectosVentaAdminPage'
import SeguimientoAdminPage from './pages/admin/SeguimientoAdminPage'
import SeparacionAdminPage from './pages/admin/SeparacionAdminPage'
import TableroAdminPage from './pages/admin/TableroAdminPage'
import UsuariosAdminPage from './pages/admin/UsuariosAdminPage'
import ValidacionAdminPage from './pages/admin/ValidacionAdminPage'
import AccesoPage from './pages/AccesoPage'
import BienvenidaPage from './pages/BienvenidaPage'
import AsesorClientePage from './pages/cliente/AsesorClientePage'
import DocumentosClientePage from './pages/cliente/DocumentosClientePage'
import GuardadosClientePage from './pages/cliente/GuardadosClientePage'
import PagosClientePage from './pages/cliente/PagosClientePage'
import PerfilClientePage from './pages/cliente/PerfilClientePage'
import ProcesoClientePage from './pages/cliente/ProcesoClientePage'
import TableroClientePage from './pages/cliente/TableroClientePage'
import VisitasClientePage from './pages/cliente/VisitasClientePage'
import Landing from './pages/Landing'
import PropiedadPage from './pages/PropiedadPage'
import ResultadosPage from './pages/ResultadosPage'

function App() {
  return (
    <SesionProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/comprar" element={<ResultadosPage modo="comprar" />} />
        <Route path="/rentar" element={<ResultadosPage modo="rentar" />} />
        <Route path="/preventa" element={<ResultadosPage modo="preventa" />} />
        <Route path="/comercial" element={<ResultadosPage modo="comercial" />} />
        <Route path="/propiedad/:folio" element={<PropiedadPage />} />
        <Route path="/acceso" element={<AccesoPage />} />
        <Route path="/bienvenida" element={<BienvenidaPage />} />

        <Route path="/mi-cuenta" element={<LayoutCliente />}>
          <Route index element={<TableroClientePage />} />
          <Route path="proceso" element={<ProcesoClientePage />} />
          <Route path="documentos" element={<DocumentosClientePage />} />
          <Route path="pagos" element={<PagosClientePage />} />
          <Route path="guardados" element={<GuardadosClientePage />} />
          <Route path="visitas" element={<VisitasClientePage />} />
          <Route path="asesor" element={<AsesorClientePage />} />
          <Route path="perfil" element={<PerfilClientePage />} />
        </Route>

        <Route path="/admin" element={<LayoutAdmin />}>
          <Route index element={<TableroAdminPage />} />
          <Route path="inventario" element={<InventarioAdminPage />} />
          <Route path="captacion" element={<CaptacionAdminPage />} />
          <Route path="separacion" element={<SeparacionAdminPage />} />
          <Route path="prospectos-captacion" element={<ProspectosCaptacionAdminPage />} />
          <Route path="prospectos-captacion/nuevo" element={<NuevoProspectoCaptacionPage />} />
          <Route path="prospectos-venta" element={<ProspectosVentaAdminPage />} />
          <Route path="prospectos-venta/nuevo" element={<NuevoProspectoVentaPage />} />
          <Route path="inbox" element={<InboxAdminPage />} />
          <Route path="agenda" element={<AgendaAdminPage />} />
          <Route path="seguimiento" element={<SeguimientoAdminPage />} />
          <Route path="usuarios" element={<UsuariosAdminPage />} />
          <Route path="usuarios/nuevo" element={<NuevoUsuarioAdminPage />} />
          <Route path="asignacion-asesores" element={<AsignacionAsesoresAdminPage />} />
          <Route path="asignacion" element={<Navigate to="/admin/asignacion-asesores" replace />} />
          <Route path="productividad" element={<ProductividadAdminPage />} />
          <Route path="validacion" element={<ValidacionAdminPage />} />
          <Route path="financiero" element={<FinancieroAdminPage />} />
          <Route path="bitacora" element={<BitacoraAdminPage />} />
          <Route path="reportes" element={<Navigate to="/admin" replace />} />
          <Route path="estadisticas" element={<EstadisticasAdminPage />} />
          <Route path="exportaciones" element={<ExportacionesAdminPage />} />
          <Route path="ajustes" element={<AjustesGeneralesAdminPage />} />
          <Route path="plantillas" element={<PlantillasDocumentosAdminPage />} />
        </Route>
      </Routes>
    </SesionProvider>
  )
}

export default App
