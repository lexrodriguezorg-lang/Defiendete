import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FolderOpen,
  FileText,
  ArrowUpRight,
  Upload,
  Download,
  Plus,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/ui/Logo";
import "./Expediente.css";

const empty = {
  title: "Mi expediente",
  revision: 0,
  processes: [],
  files: [],
  reviews: [],
  lawyers: [],
};
const statuses = {
  preparar: "En preparación",
  listo: "Listo para presentar",
  radicado: "Radicado",
  respuesta: "Respuesta recibida",
};
const uid = () => crypto.randomUUID();
function download(data, name) {
  const url = URL.createObjectURL(data);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function DashboardUsuario() {
  const { user, logout } = useAuth();
  const lawyer = user.role === "abogado";
  const [owners, setOwners] = useState([]);
  const [owner, setOwner] = useState("");
  const [data, setData] = useState(empty);
  const [selected, setSelected] = useState("");
  const [tab, setTab] = useState("resumen");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const process =
    data.processes.find((p) => p.id === selected) || data.processes[0];
  const api = async (path = "", options = {}) => {
    const response = await fetch(`/api/workspace${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${user.token}`,
        ...(options.body instanceof FormData
          ? {}
          : { "Content-Type": "application/json" }),
        ...options.headers,
      },
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(
        typeof body.detail === "string"
          ? body.detail
          : `No se pudo completar la operación (${response.status}).`,
      );
    }
    return response;
  };
  const refresh = async () =>
    setData(
      await (
        await api(owner ? `?owner=${encodeURIComponent(owner)}` : "")
      ).json(),
    );
  const run = async (task) => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await task();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  useEffect(() => {
    let alive = true;
    setLoading(true);
    api(owner ? `?owner=${encodeURIComponent(owner)}` : "")
      .then((r) => r.json())
      .then((value) => {
        if (alive) setData(value);
      })
      .catch((e) => {
        if (alive) setError(e.message);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    if (lawyer)
      api("/assigned")
        .then((r) => r.json())
        .then((value) => {
          if (alive) setOwners(value);
        })
        .catch((e) => {
          if (alive) setError(e.message);
        });
    return () => {
      alive = false;
    };
  }, [owner, user.token]);
  const save = async (value) => {
    const saved = await (
      await api("", {
        method: "PUT",
        body: JSON.stringify({
          title: value.title,
          revision: data.revision,
          processes: value.processes,
        }),
      })
    ).json();
    setData(saved);
    setNotice("Cambios guardados");
  };
  const editProcess = async (changes) =>
    save({
      ...data,
      processes: data.processes.map((p) =>
        p.id === process.id ? { ...p, ...changes } : p,
      ),
    });
  const addProcess = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    run(async () => {
      const item = {
        id: uid(),
        title: form.get("title"),
        authority: "",
        reference: "",
        verification: "Por verificar",
        role: "Por confirmar",
        summary: "",
        sources: [],
        pending: [],
        actions: [],
      };
      await save({ ...data, processes: [...data.processes, item] });
      setSelected(item.id);
    });
    event.currentTarget.reset();
  };
  const importFile = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    run(async () => {
      const incoming = JSON.parse(await file.text());
      if (!Array.isArray(incoming.processes))
        throw new Error(
          "El archivo debe contener un expediente exportado por Defiéndete.",
        );
      if (
        data.processes.length &&
        !window.confirm(
          "La importación reemplazará la organización actual. Se conservará la versión anterior en el servidor.",
        )
      )
        return;
      await save(incoming);
    });
    event.target.value = "";
  };
  const upload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    run(async () => {
      const body = new FormData();
      body.append("file", file);
      const stored = await (
        await api("/files", { method: "POST", body })
      ).json();
      if (process)
        await editProcess({
          sources: [
            ...process.sources,
            `Archivo ${stored.id} · ${stored.name}`,
          ],
        });
      await refresh();
      setNotice("Archivo conservado con huella SHA-256");
    });
    event.target.value = "";
  };
  const openFile = (file) =>
    run(async () =>
      download(await (await api(`/files/${file.id}`)).blob(), file.name),
    );
  const pending = data.processes.flatMap((p) =>
    p.actions
      .filter((a) => ["preparar", "listo"].includes(a.status))
      .map((a) => ({ ...a, process: p })),
  );
  return (
    <div className="exp-app">
      <aside className="exp-sidebar">
        <Logo size={32} showText />
        <div className="exp-identity">
          <span>ESPACIO DE TRABAJO</span>
          <strong>{user.nombre}</strong>
        </div>
        {lawyer && (
          <label>
            Expediente asignado
            <select value={owner} onChange={(e) => setOwner(e.target.value)}>
              <option value="">Seleccionar ciudadano</option>
              {owners.map((email) => (
                <option key={email}>{email}</option>
              ))}
            </select>
          </label>
        )}
        <div className="exp-process-list">
          {data.processes.map((p) => (
            <button
              key={p.id}
              aria-current={process?.id === p.id ? "page" : undefined}
              onClick={() => {
                setSelected(p.id);
                setTab("resumen");
              }}
            >
              <FolderOpen size={17} />
              <span>
                {p.title}
                <small>{p.verification}</small>
              </span>
            </button>
          ))}
        </div>
        {!lawyer && (
          <form onSubmit={addProcess} className="exp-new">
            <input
              name="title"
              aria-label="Nombre de la actuación"
              placeholder="Nombre de una actuación"
              required
              maxLength={200}
            />
            <button disabled={busy}>
              <Plus size={16} /> Añadir actuación
            </button>
          </form>
        )}
        <button onClick={logout} className="exp-logout">
          <LogOut size={16} /> Cerrar sesión
        </button>
      </aside>
      <main className="exp-main">
        <header className="exp-header">
          <div>
            <span className="exp-eyebrow">
              {lawyer ? "REVISIÓN PROFESIONAL" : "SEGUIMIENTO PERSONAL"}
            </span>
            <h1>{data.title}</h1>
            <p>
              {data.processes.length} actuaciones organizadas · Versión{" "}
              {data.revision}
            </p>
          </div>
          <div className="exp-tools">
            {!lawyer && (
              <label className="exp-button">
                <Upload size={16} /> Importar expediente
                <input
                  type="file"
                  accept=".json"
                  onChange={importFile}
                  disabled={busy}
                  hidden
                />
              </label>
            )}
            <button
              disabled={!data.processes.length || busy}
              onClick={() =>
                download(
                  new Blob([JSON.stringify(data, null, 2)], {
                    type: "application/json",
                  }),
                  "expediente-privado.json",
                )
              }
            >
              <Download size={16} /> Exportar organización
            </button>
          </div>
        </header>
        {error && (
          <div role="alert" className="exp-error">
            {error}
            <button onClick={() => run(refresh)}>Recargar</button>
          </div>
        )}
        {notice && (
          <p role="status" className="exp-notice">
            {notice}
          </p>
        )}
        {loading ? (
          <p>Cargando expediente…</p>
        ) : (
          <>
            {pending.length > 0 && (
              <section className="exp-next">
                <div>
                  <span className="exp-eyebrow">PRÓXIMOS TRÁMITES</span>
                  <h2>Lo que puedes mover ahora</h2>
                </div>
                <div className="exp-next-grid">
                  {pending.slice(0, 3).map((a) => (
                    <button
                      key={a.id}
                      onClick={() => {
                        setSelected(a.process.id);
                        setTab("tramites");
                      }}
                    >
                      <span>{a.process.authority || a.process.title}</span>
                      <strong>{a.title}</strong>
                      <small>
                        {a.actor} · {statuses[a.status]}{" "}
                        <ArrowUpRight size={14} />
                      </small>
                    </button>
                  ))}
                </div>
              </section>
            )}
            {!process ? (
              <section className="exp-empty">
                <FolderOpen size={36} />
                <h2>Tu expediente empieza aquí</h2>
                <p>
                  Añade una actuación o importa una organización preparada. Cada
                  trámite conserva sus fuentes, pruebas y pendientes.
                </p>
                <Link to="/caso">
                  Consultar una situación jurídica <ArrowUpRight size={16} />
                </Link>
              </section>
            ) : (
              <section className="exp-detail">
                <div className="exp-case-title">
                  <div>
                    <span className="exp-eyebrow">
                      {process.authority || "Autoridad por identificar"}
                    </span>
                    <h2>{process.title}</h2>
                  </div>
                  <span className="exp-badge">{process.verification}</span>
                </div>
                <div className="exp-reference">
                  <div>
                    <small>Referencia</small>
                    <strong>
                      {process.reference || "Pendiente de radicación"}
                    </strong>
                  </div>
                  <div>
                    <small>Tu calidad en esta actuación</small>
                    <strong>{process.role}</strong>
                  </div>
                </div>
                <nav className="exp-tabs" aria-label="Detalle del expediente">
                  {[
                    ["resumen", "Hechos y verificación"],
                    ["pruebas", "Pruebas y documentos"],
                    ["tramites", "Trámites y constancias"],
                    ["revision", "Revisión del abogado"],
                  ].map(([id, label]) => (
                    <button
                      key={id}
                      aria-pressed={tab === id}
                      onClick={() => setTab(id)}
                    >
                      {label}
                    </button>
                  ))}
                </nav>
                {tab === "resumen" && (
                  <div className="exp-summary">
                    <p className="exp-story">
                      {process.summary ||
                        "Registra el contexto y el objetivo de esta actuación."}
                    </p>
                    <div className="exp-columns">
                      <div>
                        <h3>Fuentes registradas</h3>
                        {process.sources.map((s, i) => (
                          <p key={i} className="exp-line">
                            <FileText size={15} />
                            {s}
                          </p>
                        ))}
                        {!process.sources.length && (
                          <p>Pendiente de aportar fuentes.</p>
                        )}
                      </div>
                      <div>
                        <h3>Falta establecer</h3>
                        {process.pending.map((s, i) => (
                          <p key={i} className="exp-question">
                            {s}
                          </p>
                        ))}
                        {!process.pending.length && (
                          <p>Sin pendientes registrados.</p>
                        )}
                      </div>
                    </div>
                    {!lawyer && (
                      <details>
                        <summary>Actualizar contexto y verificación</summary>
                        <form
                          key={process.id + data.revision}
                          onSubmit={(e) => {
                            e.preventDefault();
                            const f = new FormData(e.currentTarget);
                            run(() =>
                              editProcess({
                                authority: f.get("authority"),
                                reference: f.get("reference"),
                                role: f.get("role"),
                                verification: f.get("verification"),
                                summary: f.get("summary"),
                                sources: f
                                  .get("sources")
                                  .split("\n")
                                  .filter(Boolean),
                                pending: f
                                  .get("pending")
                                  .split("\n")
                                  .filter(Boolean),
                              }),
                            );
                          }}
                          className="exp-form"
                        >
                          {[
                            "authority",
                            "reference",
                            "role",
                            "verification",
                          ].map((key, i) => (
                            <label key={key}>
                              {
                                [
                                  "Autoridad",
                                  "Radicado o referencia",
                                  "Calidad procesal",
                                  "Estado de verificación",
                                ][i]
                              }
                              <input
                                name={key}
                                defaultValue={process[key]}
                                required={key === "verification"}
                              />
                            </label>
                          ))}
                          <label>
                            Contexto
                            <textarea
                              name="summary"
                              defaultValue={process.summary}
                              rows={5}
                            />
                          </label>
                          <label>
                            Fuentes, una por línea
                            <textarea
                              name="sources"
                              defaultValue={process.sources.join("\n")}
                            />
                          </label>
                          <label>
                            Preguntas pendientes, una por línea
                            <textarea
                              name="pending"
                              defaultValue={process.pending.join("\n")}
                            />
                          </label>
                          <button disabled={busy}>Guardar contexto</button>
                        </form>
                      </details>
                    )}
                  </div>
                )}
                {tab === "pruebas" && (
                  <div className="exp-pane">
                    <h3>Archivos del expediente</h3>
                    {!lawyer && (
                      <label className="exp-button">
                        <Upload size={16} /> Conservar original
                        <input
                          type="file"
                          onChange={upload}
                          disabled={busy}
                          hidden
                        />
                      </label>
                    )}
                    <p className="exp-hint">
                      Cada archivo conserva fecha de incorporación y huella de
                      integridad. La descarga incluye el original. La
                      exportación de organización contiene su índice.
                    </p>
                    {data.files.map((f) => (
                      <button
                        className="exp-file"
                        key={f.id}
                        onClick={() => openFile(f)}
                        disabled={busy}
                      >
                        <FileText />
                        <span>
                          <strong>{f.name}</strong>
                          <small>
                            {Math.ceil(f.size / 1024)} KB ·{" "}
                            {new Date(f.created).toLocaleDateString("es-CO")} ·
                            SHA-256 {f.sha256.slice(0, 16)}…
                          </small>
                        </span>
                        <Download size={16} />
                      </button>
                    ))}
                    {!data.files.length && (
                      <p>Aún no se han cargado archivos originales.</p>
                    )}
                  </div>
                )}
                {tab === "tramites" && (
                  <div className="exp-pane">
                    {process.actions.map((a) => (
                      <article className="exp-action" key={a.id}>
                        <div>
                          <small>{a.actor}</small>
                          <h3>{a.title}</h3>
                          <span className="exp-badge">
                            {statuses[a.status]}
                          </span>
                        </div>
                        {a.deadline && (
                          <p>
                            Fecha registrada {a.deadline} · Fuente{" "}
                            {a.deadline_source}
                          </p>
                        )}
                        {!lawyer && (
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              const f = new FormData(e.currentTarget);
                              const changed = {
                                ...a,
                                status: f.get("status"),
                                receipt: f.get("receipt"),
                                submitted_at: f.get("submitted_at"),
                              };
                              run(() =>
                                editProcess({
                                  actions: process.actions.map((item) =>
                                    item.id === a.id ? changed : item,
                                  ),
                                }),
                              );
                            }}
                          >
                            <label>
                              Estado
                              <select name="status" defaultValue={a.status}>
                                {Object.entries(statuses).map(
                                  ([key, label]) => (
                                    <option key={key} value={key}>
                                      {label}
                                    </option>
                                  ),
                                )}
                              </select>
                            </label>
                            <label>
                              Constancia
                              <select name="receipt" defaultValue={a.receipt}>
                                <option value="">Seleccionar archivo</option>
                                {data.files.map((f) => (
                                  <option key={f.id} value={f.id}>
                                    {f.name}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <label>
                              Fecha de radicación
                              <input
                                type="date"
                                name="submitted_at"
                                defaultValue={a.submitted_at}
                              />
                            </label>
                            <button disabled={busy}>Guardar estado</button>
                          </form>
                        )}
                      </article>
                    ))}
                    {!lawyer && (
                      <form
                        className="exp-inline"
                        onSubmit={(e) => {
                          e.preventDefault();
                          const f = new FormData(e.currentTarget);
                          run(() =>
                            editProcess({
                              actions: [
                                ...process.actions,
                                {
                                  id: uid(),
                                  title: f.get("title"),
                                  actor: f.get("actor"),
                                  status: "preparar",
                                  receipt: "",
                                  submitted_at: "",
                                  deadline: "",
                                  deadline_source: "",
                                },
                              ],
                            }),
                          );
                          e.currentTarget.reset();
                        }}
                      >
                        <input
                          name="title"
                          placeholder="Siguiente trámite"
                          required
                          aria-label="Siguiente trámite"
                        />
                        <select name="actor" aria-label="Responsable">
                          <option>Ciudadano</option>
                          <option>Abogado</option>
                          <option>Autoridad</option>
                        </select>
                        <button disabled={busy}>Añadir trámite</button>
                      </form>
                    )}
                  </div>
                )}
                {tab === "revision" && (
                  <div className="exp-pane">
                    <h3>Entrega y observaciones</h3>
                    <p>
                      El profesional asignado accede al expediente y sus
                      archivos. Cada observación conserva autor y fecha.
                    </p>
                    {!lawyer && (
                      <>
                        <form
                          className="exp-inline"
                          onSubmit={(e) => {
                            e.preventDefault();
                            const f = new FormData(e.currentTarget);
                            run(async () => {
                              await api("/grants", {
                                method: "POST",
                                body: JSON.stringify({ email: f.get("email") }),
                              });
                              await refresh();
                            });
                          }}
                        >
                          <input
                            type="email"
                            name="email"
                            required
                            placeholder="Correo del abogado verificado"
                            aria-label="Correo del abogado"
                          />
                          <button disabled={busy}>
                            <ShieldCheck size={16} /> Autorizar acceso
                          </button>
                        </form>
                        {data.lawyers.map((email) => (
                          <p key={email}>
                            {email}{" "}
                            <button
                              disabled={busy}
                              onClick={() =>
                                run(async () => {
                                  await api(
                                    `/grants/${encodeURIComponent(email)}`,
                                    { method: "DELETE" },
                                  );
                                  await refresh();
                                })
                              }
                            >
                              Revocar acceso
                            </button>
                          </p>
                        ))}
                      </>
                    )}
                    {data.reviews
                      .filter((r) => r.process_id === process.id)
                      .map((r) => (
                        <article className="exp-review" key={r.id}>
                          <small>
                            {r.actor} ·{" "}
                            {new Date(r.created).toLocaleString("es-CO")} ·{" "}
                            {r.decision}
                          </small>
                          <p>{r.text}</p>
                        </article>
                      ))}
                    <form
                      className="exp-form"
                      onSubmit={(e) => {
                        e.preventDefault();
                        const f = new FormData(e.currentTarget);
                        run(async () => {
                          await api("/reviews", {
                            method: "POST",
                            body: JSON.stringify({
                              owner: data.owner,
                              process_id: process.id,
                              text: f.get("text"),
                              decision: f.get("decision"),
                            }),
                          });
                          await refresh();
                        });
                        e.currentTarget.reset();
                      }}
                    >
                      <label>
                        Observación o decisión
                        <textarea name="text" required minLength={5} />
                      </label>
                      <select name="decision" aria-label="Tipo de observación">
                        <option value="observacion">
                          Registrar observación
                        </option>
                        {!lawyer && (
                          <>
                            <option value="aceptar">Aceptar ajuste</option>
                            <option value="pedir_aclaracion">
                              Pedir aclaración
                            </option>
                          </>
                        )}
                      </select>
                      <button disabled={busy}>Guardar revisión</button>
                    </form>
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
