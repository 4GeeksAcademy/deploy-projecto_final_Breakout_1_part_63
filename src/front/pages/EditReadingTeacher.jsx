import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import UploadFiles from "../components/UploadFiles.jsx";

export const EditReadingTeacher = () => {
    const backend = import.meta.env.VITE_BACKEND_URL;
    const navigate = useNavigate();
    const { id } = useParams();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [groupId, setGroupId] = useState("");
    const [archiveUrl, setArchiveUrl] = useState("");

    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState(null);
    const [okMsg, setOkMsg] = useState(null);
    const [uploading, setUploading] = useState(false);

    const token = localStorage.getItem("token");

    const authHeaders = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
    };

    const getFileName = (url) => {
        if (!url) return "";
        return url.split("/").pop();
    };

    // Cargar lectura
    useEffect(() => {
        if (!token) {
            setErrorMsg("No autenticado");
            setLoading(false);
            return;
        }

        const fetchReading = async () => {
            try {
                const resp = await fetch(`${backend}/reading/${id}`, {
                    method: "GET",
                    headers: authHeaders
                });

                if (resp.status === 401) {
                    throw new Error("Sesión expirada");
                }

                const data = await resp.json();
                if (!resp.ok) throw new Error(data?.msg || "Error cargando lectura");

                setTitle(data.title);
                setDescription(data.content);
                setGroupId(String(data.group_id));
                setArchiveUrl(data.reading_url || "");

            } catch (error) {
                setErrorMsg(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchReading();
    }, [backend, id, token]);

    // Cargar grupos
    useEffect(() => {
        if (!token) return;

        const loadGroups = async () => {
            try {
                const resp = await fetch(`${backend}/groups`, {
                    headers: authHeaders
                });

                if (resp.status === 401) {
                    throw new Error("Sesión expirada");
                }

                const data = await resp.json();
                if (!resp.ok) throw new Error("Error cargando grupos");

                setGroups(data);
            } catch (error) {
                console.error(error);
            }
        };

        loadGroups();
    }, [backend, token]);

    // Actualizar lectura
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg(null);
        setOkMsg(null);

        if (uploading) {
            setErrorMsg("Espera a que termine la subida del archivo");
            return;
        }

        try {
            const payload = {
                title: title,
                content: description,
                group_id: Number(groupId),
                reading_url: archiveUrl ? archiveUrl : null
            }

            const resp = await fetch(`${backend}/editreading/${id}`, {
                method: "PUT",
                headers: authHeaders,
                body: JSON.stringify(payload)
            });

            if (resp.status === 401) {
                throw new Error("Sesión expirada");
            }

            const data = await resp.json();
            if (!resp.ok) throw new Error(data?.msg || "Error actualizando");

            setOkMsg("Lectura actualizada correctamente");

            setTimeout(() => {
                navigate("/teacher/readings");
            }, 1200);

        } catch (error) {
            setErrorMsg(error.message);
        }
    };

    // Eliminar lectura
    const handleDelete = async () => {
        const confirmDelete = window.confirm(
            "¿Seguro que deseas eliminar esta lectura?\n\nEsta acción no se puede deshacer."
        );

        if (!confirmDelete) return;

        try {
            const resp = await fetch(`${backend}/deletereading/${id}`, {
                method: "DELETE",
                headers: authHeaders
            });

            if (resp.status === 401) {
                throw new Error("Sesión expirada");
            }

            const data = await resp.json();
            if (!resp.ok) {
                throw new Error(data?.msg || "Error eliminando lectura");
            }

            alert("Lectura eliminada correctamente");
            navigate("/teacher/readings");

        } catch (error) {
            setErrorMsg(error.message);
        }
    };

    if (loading) {
        return (
            <div className="page-teacher-todos d-flex justify-content-center align-items-center">
                <div className="text-center">
                    <div className="spinner-border mb-3 g-color" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                    <p className="sidebar-title">Cargando lectura...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-teacher-todos">
            <div className="container-fluid">
                <div className="row">

                    

                    {/* COLUMNA PRINCIPAL CENTRADA */}
                    <div className="col-12 d-flex justify-content-center">

                        <div className="w-100 px-4" style={{ maxWidth: "900px" }}>

                            {/* HEADER CON FLECHA */}
                            <div className="main-header mb-4">
                                <div className="main-header-inner main-header-inner--todo d-flex align-items-center gap-3">
                                    <Link
                                        to="/teacher/readings"
                                        className="btn btn-light rounded-circle p-1"
                                    >
                                        ←   Volver 
                                    </Link>

                                    <div>
                                        <h2 className="header-title mb-0 ">
                                            ✏️ Editar lectura
                                        </h2>
                                        <p className="header-subtitle mb-0 me-4">
                                            Modifica los detalles de la lectura existente
                                        </p>
                                    </div>
                                </div>
                            </div>
                           

                            <div className="main-content main-content--todo">

                                {/* Alertas */}
                                {errorMsg && (
                                    <div className="alert tile-pink d-flex align-items-center gap-2 mb-4">
                                        <i className="bi bi-exclamation-triangle-fill v-color"></i>
                                        {errorMsg}
                                        <button
                                            type="button"
                                            className="btn-close ms-auto"
                                            onClick={() => setErrorMsg(null)}
                                        ></button>
                                    </div>
                                )}

                                {okMsg && (
                                    <div className="alert tile-teal text-white d-flex align-items-center gap-2 mb-4">
                                        <i className="bi bi-check-circle-fill"></i>
                                        {okMsg}
                                        <button
                                            type="button"
                                            className="btn-close btn-close-white ms-auto"
                                            onClick={() => setOkMsg(null)}
                                        ></button>
                                    </div>
                                )}

                                {/* FORMULARIO */}
                                <div className="ctf-panel card shadow-sm">
                                    <div className="card-body">
                                        <form onSubmit={handleSubmit}>

                                            {/* Título */}
                                            <div className="mb-4">
                                                <label className="ctf-label form-label">
                                                    Título de la lectura
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-lg"
                                                    value={title}
                                                    onChange={(e) => setTitle(e.target.value)}
                                                    required
                                                />
                                            </div>

                                            {/* Grupo */}
                                            <div className="mb-4">
                                                <label className="ctf-label form-label">
                                                    Grupo asignado
                                                </label>
                                                <select
                                                    className="form-select form-select-lg"
                                                    value={groupId}
                                                    onChange={(e) => setGroupId(e.target.value)}
                                                    required
                                                >
                                                    <option value="">Seleccionar grupo...</option>
                                                    {groups.map(g => (
                                                        <option key={g.id} value={g.id}>
                                                            👥 {g.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Descripción */}
                                            <div className="mb-4">
                                                <label className="ctf-label form-label">
                                                    Descripción
                                                </label>
                                                <textarea
                                                    className="form-control"
                                                    rows={6}
                                                    value={description}
                                                    onChange={(e) => setDescription(e.target.value)}
                                                />
                                            </div>

                                            {/* Archivo */}
                                            <div className="mb-5">
                                                <label className="ctf-label form-label">
                                                    Archivo adjunto
                                                </label>

                                                {archiveUrl ? (
                                                    <div className="p-3 border rounded">
                                                        <a
                                                            href={archiveUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            {getFileName(archiveUrl)}
                                                        </a>
                                                        <div className="mt-2">
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-outline-danger"
                                                                onClick={() => setArchiveUrl("")}
                                                            >
                                                                Eliminar archivo
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <UploadFiles
                                                        onUpload={(url) => setArchiveUrl(url)}
                                                        setUploading={setUploading}
                                                    />
                                                )}
                                            </div>

                                            {/* Botones */}
                                            <div className="d-flex justify-content-between">
                                                <button
                                                    type="button"
                                                    className="btn btn-danger"
                                                    onClick={handleDelete}
                                                >
                                                    Eliminar
                                                </button>

                                                <button
                                                    type="submit"
                                                    className="btn btn-success"
                                                    disabled={uploading}
                                                >
                                                    Guardar cambios
                                                </button>
                                            </div>

                                        </form>
                                    </div>
                                </div>

                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};
