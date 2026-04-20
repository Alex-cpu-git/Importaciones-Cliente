import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { FiSearch, FiPhoneCall, FiCheckCircle, FiClock, FiSettings, FiMail, FiMapPin, FiFacebook, FiX, FiInfo } from 'react-icons/fi';
import './App.css';

interface Machine {
  id: string;
  name: string;
  brand: string;
  type: string;
  year: number;
  status: string;
  price: number;
  stock: number;
  imageUrl?: string;
  features?: { key: string; value: string }[];
}

function App() {
  const [machinery, setMachinery] = useState<Machine[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Todos');
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'machines'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Machine));
      // Only show items that are not deleted or strictly internal if needed,
      // but for now we show all active inventory.
      setMachinery(data);
    }, (error) => {
      console.error("Error cargando inventario:", error);
    });

    return () => unsubscribe();
  }, []);



  const handleWhatsApp = (machine: Machine) => {
    const text = `Hola P&M S.A.C, estoy interesado en el equipo: *${machine.name}* (${machine.brand} - ${machine.year}). ¿Podrían darme más detalles?`;
    window.open(`https://wa.me/51979695821?text=${encodeURIComponent(text)}`, '_blank');
  };

  const filteredMachinery = machinery.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'Todos' || m.type === filterType;
    return matchesSearch && matchesType;
  });

  const categories = ['Todos', ...new Set(machinery.map(m => m.type).filter(Boolean))];

  return (
    <div className="client-catalog">
      <header className="catalog-header">
        <div className="header-content">
          <div className="logo-area">
            <div className="logo-box">
              <img src="/public/logo1.png" alt="Logo" />
            </div>
            <div>
              <h1>IMPORTACIONES</h1>
              <span>Especialistas en Maquinaria</span>
            </div>
          </div>
          <a href="https://wa.me/51979695821" target="_blank" rel="noreferrer" className="contact-btn">
            <FiPhoneCall /> Contáctanos
          </a>
        </div>
      </header>

      <section className="hero-banner">
        <div className="hero-overlay"></div>
        <div className="hero-text">
          <h2>Encuentra el Equipo Perfecto para tu Obra</h2>
          <p>Catálogo actualizado en tiempo real con disponibilidad garantizada.</p>

          <div className="search-box">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="¿Qué estás buscando? Ej: Tornos, Fresadoras.."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </section>

      <main className="catalog-main">
        <div className="filters">
          {categories.map(cat => (
            <button
              key={cat}
              className={`filter-btn ${filterType === cat ? 'active' : ''}`}
              onClick={() => setFilterType(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {filteredMachinery.length === 0 ? (
          <div className="no-results">
            <h3>No se encontraron equipos</h3>
            <p>Intenta cambiar tu búsqueda o filtro.</p>
          </div>
        ) : (
          <div className="machinery-grid">
            {filteredMachinery.map(machine => (
              <div className="machine-card" key={machine.id}>
                <div className="card-image-box">
                  {machine.imageUrl ? (
                    <img src={machine.imageUrl} alt={machine.name} loading="lazy" />
                  ) : (
                    <div className="no-image">Imagen no disponible</div>
                  )}
                  <div className={`status-badge ${machine.status === 'En Stock' ? 'stock' : machine.status === 'Importación' ? 'transit' : 'reserved'}`}>
                    {machine.status === 'En Stock' ? <FiCheckCircle /> : <FiClock />} {machine.status}
                  </div>
                </div>

                <div className="card-content">
                  <div className="brand-tag">{machine.brand}</div>
                  <h3 className="machine-title">{machine.name}</h3>

                  <div className="specs-grid">
                    <div className="spec-item">
                      <span>Año:</span>
                      <strong>{machine.year}</strong>
                    </div>
                    <div className="spec-item">
                      <span>Tipo:</span>
                      <strong>{machine.type}</strong>
                    </div>
                    {machine.features && machine.features[0] && (
                      <div className="spec-item full-width">
                        <span><FiSettings /> {machine.features[0].key}:</span>
                        <strong>{machine.features[0].value}</strong>
                      </div>
                    )}
                  </div>
                  <div className="card-footer card-actions">
                    <button className="btn-details" onClick={() => setSelectedMachine(machine)}>
                      <FiInfo /> Más Detalles
                    </button>
                    <button className="btn-whatsapp" onClick={() => handleWhatsApp(machine)}>
                      Mas informacion
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {selectedMachine && (
        <div className="client-modal-overlay" onClick={() => setSelectedMachine(null)}>
          <div className="client-modal-content" onClick={e => e.stopPropagation()}>
            <button className="client-modal-close" onClick={() => setSelectedMachine(null)}><FiX size={24} /></button>

            <div className="client-modal-body">
              <div className="client-modal-image">
                {selectedMachine.imageUrl ? (
                  <img src={selectedMachine.imageUrl} alt={selectedMachine.name} />
                ) : (
                  <div className="no-image">Sin Imagen</div>
                )}
                <div className={`status-badge ${selectedMachine.status === 'En Stock' ? 'stock' : selectedMachine.status === 'Importación' ? 'transit' : 'reserved'}`}>
                  {selectedMachine.status === 'En Stock' ? <FiCheckCircle /> : <FiClock />} {selectedMachine.status}
                </div>
              </div>

              <div className="client-modal-info">
                <span className="brand-tag">{selectedMachine.brand}</span>
                <h2>{selectedMachine.name}</h2>
                <p className="modal-category">Año: {selectedMachine.year} • Categoría: {selectedMachine.type}</p>
                <div className="stock-info">
                  <strong>Inventario:</strong> {selectedMachine.stock > 0 ? `${selectedMachine.stock} unidades` : 'Consultar disponibilidad'}
                </div>

                <div className="features-list-full">
                  <h3>Especificaciones Técnicas Completas</h3>
                  {selectedMachine.features && selectedMachine.features.length > 0 ? (
                    <ul>
                      {selectedMachine.features.map((f, i) => (
                        <li key={i}>
                          <span><FiSettings className="feat-icon" /> {f.key}:</span>
                          <strong>{f.value}</strong>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="no-specs">No hay especificaciones adicionales registradas para este equipo.</p>
                  )}
                </div>

                <button className="btn-whatsapp modal-wa-btn" onClick={() => handleWhatsApp(selectedMachine)}>
                  <FiPhoneCall /> Consultar Especialista por WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="catalog-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>P&amp;M IMPORTACIONES S.A.C</h3>
            <p>Especialistas en venta y alquiler de maquinaria pesada. Excelencia, innovación y garantía directa para el éxito de tus obras.</p>
          </div>

          <div className="footer-section">
            <h3><FiPhoneCall /> Central WhatsApp</h3>
            <div className="contact-group">
              <a href="https://wa.me/51979695821" target="_blank" rel="noreferrer">979 695 821</a>
              <a href="https://wa.me/51990030984" target="_blank" rel="noreferrer">990 030 984</a>
              <a href="https://wa.me/51968042171" target="_blank" rel="noreferrer">968 042 171</a>
            </div>
          </div>

          <div className="footer-section">
            <h3>Contactos Oficiales</h3>
            <div className="contact-item">
              <FiFacebook className="contact-icon" />
              <a href="https://facebook.com" target="_blank" rel="noreferrer">Maquinarias P&amp;M S.A.C</a>
            </div>
            <div className="contact-item">
              <FiMail className="contact-icon" />
              <a href="mailto:invercionespm@outlook.com">invercionespm@outlook.com</a>
            </div>
            <div className="contact-item">
              <FiMapPin className="contact-icon address-icon" />
              <span>Jr. Acomayo 468 - 472 - 476<br />Cercado de Lima</span>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Maquinarias P&amp;M S.A.C. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
