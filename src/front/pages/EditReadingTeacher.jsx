import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

   //endpoint para cargar lectura
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

    // endpoint para cargar grupo
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

    // endpoint put reading
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

    //fetch para eliminar lectura

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


    if (loading) return <div className="container mt-5">Cargando lectura...</div>;

    return (
        <div className="container mt-5">
<button
        type="button"
        className="btn btn-sm btn-outline-secondary mb-3"
        onClick={() => navigate(-1)}
      >
        ← Volver a todas las lecturas
      </button>
            <h2 className="mb-4">
    Editar lectura: <span>{title}</span>
</h2>

            {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
            {okMsg && <div className="alert alert-success">{okMsg}</div>}

            <form onSubmit={handleSubmit}>

              
                <div className="mb-3">
                    <label className="form-label">Título</label>
                    <input
                        className="form-control"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>

               
                <div className="mb-3">
                    <label className="form-label">Grupo</label>
                    <select
                        className="form-select"
                        value={groupId}
                        onChange={(e) => setGroupId(e.target.value)}
                        required
                    >
                        <option value="">Selecciona grupo</option>
                        {groups.map(g => (
                            <option key={g.id} value={g.id}>
                                {g.name}
                            </option>
                        ))}
                    </select>
                </div>

                
                <div className="mb-3">
                    <label className="form-label">Descripción</label>
                    <textarea
                        className="form-control"
                        rows={6}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Archivo adjunto</label>

                    {archiveUrl ? (
                        <div className="border p-3 rounded bg-light">

                            <p className="mb-2">📎 Archivo subido:</p>

                            <a
                                href={archiveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                download
                            >
                                {getFileName(archiveUrl)}
                            </a>

                            <div className="mt-3">
                                <button
                                    type="button"
                                    className="btn btn-danger btn-sm"
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

                <button
                    type="submit"
                    className="btn btn-warning"
                    disabled={uploading}
                >
                    {uploading ? "Subiendo..." : "Guardar cambios"}
                </button>

                    <button
    type="button"
    className="btn btn-danger ms-3"
    onClick={handleDelete}
>
    Eliminar lectura
</button>

            </form>

        </div>
    );
};
