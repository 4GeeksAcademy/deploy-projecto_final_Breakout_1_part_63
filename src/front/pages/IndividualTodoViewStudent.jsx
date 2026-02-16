import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import portada from "../assets/img/portada.png";
import SubirArchivo from "../components/UploadFiles";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const IndividualTodoViewStudent = () => {
  const { store, dispatch } = useGlobalReducer();
  const params = useParams();

  const [description, setDescription] = useState("");
  const [err, setErr] = useState(null);
  const [okMsg, setOkMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const [uploading, setUploading] = useState(false);
  const [archiveUrl, setArchiveUrl] = useState(null);

  const [todo, setTodo] = useState(null);
  const [me, setMe] = useState(null);

  useEffect(() => {
    getTodo();
    
    getMyStudentGroup();
   
  }, [params.id]);

  const getTodo = async () => {
    setErr(null);
    try {
      const backend = import.meta.env.VITE_BACKEND_URL;
      const resp = await fetch(`${backend}/todos/${params.id}`);
       const data = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error("Error al cargar tarea");
      setTodo(data);
    } catch (error) {
      setErr(error.message);
    }
  };



const getMyStudentGroup = async () => {
  const backend = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem("token");
  if (!token) return;

  const resp = await fetch(`${backend}/my-student-group`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) return;

 
  dispatch({ type: "SET_STUDENT_GROUP_ID", payload: data.id });
};


  

  const handleSubmit = async (e) => {
    e.preventDefault();

   
    setOkMsg(null);
    setErrorMsg(null);

    if (!description.trim()) {
       setErrorMsg("Completá la descripción.");
      return;
    }
    if (!archiveUrl) {
      setErrorMsg("Adjuntá un archivo antes de subir.");
      return;
    }
    if (!store?.student_group_id) {
    setErrorMsg("No pude identificar tu student_group_id. Volvé a iniciar sesión e intentá de nuevo.");
    return;
  }

    try {
      const backend = import.meta.env.VITE_BACKEND_URL;
      const token = localStorage.getItem("token");
  
console.log("ME:", me);
console.log("STORE student_group_id:", store?.student_group_id);


      const payload = {
        todo_id: Number(params.id),
         student_id:  store.student_group_id,
        description: description.trim(),
        response_url: archiveUrl,   
              };
console.log("Payload:", payload);
      const resp = await fetch(`${backend}/submission`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await resp.json().catch(() => null);
       if (!resp.ok) throw new Error(data?.msg || "Error subiendo tarea");

      setOkMsg("Tarea subida con éxito");
      setDescription("");
      setArchiveUrl(null);
    } catch (e2) {
      setErrorMsg(e2.message);
    }
  };

  if (err) return <div className="container mt-5 alert alert-danger">{err}</div>;
  if (!todo) return <div className="container mt-5">Cargando tarea...</div>;

  return (
    <div className="container mt-1">
      <div className="m-0 p-0">
        <img
          src={portada}
          className="img-fluid w-100 rounded"
          alt="cover"
          style={{ maxHeight: "250px", objectFit: "cover" }}
        />
         </div>
 
      <div className="text-center col-8 mx-auto">
     
         
        <h2 className="mb-3 mt-2">Título de tarea: {todo.title} </h2>
        <hr />

        <h5>Instrucciones de tarea:</h5>
        <p className="  mt-3 text-start">
            Fecha: {todo.due_date || "Sin fecha"}
          </p>
        <p className="mt-1 text-start">{todo.description}</p>

        {errorMsg && <div className="alert alert-danger text-start">{errorMsg}</div>}
        {okMsg && <div className="alert alert-success text-start">{okMsg}</div>}

         <div className="row g-3 justify-content-center mt-3">
          <div className="col-auto">
            <a
              href={todo.archive_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ backgroundColor: "#5B72EE", borderColor: "#5B72EE", width: "220px" }}
            >
              Descargar material
            </a>
          </div>

          <form onSubmit={handleSubmit} className="col-12 mt-3">
            <div className="mb-1 text-start">
              <label className="form-label fw-semibold">Descripción</label>
              <textarea
                className="form-control ctf-input"
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Agregar descripción de la tarea"
              />
            </div>

            <div className="mb-4">
              <div className="d-flex align-items-center gap-3 flex-wrap">
                <SubirArchivo onUpload={setArchiveUrl} setUploading={setUploading} />
                {archiveUrl ? (
                  <span className="text-success fw-semibold">Archivo adjunto ✔</span>
                ) : (
                  <span className="text-muted">No hay archivo adjunto</span>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ backgroundColor: "#49BBBD", borderColor: "#49BBBD", width: "220px" }}
              disabled={uploading}
            >
              {uploading ? "Subiendo archivo..." : "Subir tarea"}
            </button>
          </form>
        </div>

        <Link to="/todos" className="btn btn-light border border-1 mt-4 mb-5">
          Volver a todas las tareas
         </Link>
      </div>
    </div>
  );
};
