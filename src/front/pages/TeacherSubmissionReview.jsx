import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export const TeacherSubmissionReview = () => {
  const { store } = useGlobalReducer();
  const { todoId, submissionId } = useParams();
  const navigate = useNavigate();
  const backend = (import.meta.env.VITE_BACKEND_URL || "").trim();
  const token = localStorage.getItem("token");

  const [todo, setTodo] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [students, setStudents] = useState([]);

  const [status, setStatus] = useState(null);
  const [stateValue, setStateValue] = useState("pendiente");
  const [feedback, setFeedback] = useState("");

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
   const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [okMsg, setOkMsg] = useState(null);
  const authHeaders = useMemo(() => {
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, [token]);

  const mapStateToBackend = (uiState) => {
    const m = {
      pendiente: "PENDING",
      aprobado: "APPROVED",
      rechazado: "REJECTED",
    };
    return m[uiState] || "PENDING";
  };

  const mapStateToUI = (apiState) => {
    const s = String(apiState || "").toUpperCase();
    if (s === "APPROVED") return "aprobado";
    if (s === "REJECTED") return "rechazado";
    return "pendiente";
  };

  const safeReadJsonOrTextError = async (resp) => {
    const ct = resp.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      const data = await resp.json().catch(() => null);
      return { json: data, text: null, ct };
    }
    const text = await resp.text().catch(() => "");
    return { json: null, text, ct };
  };

  const getTeacherId = () => {
    const u = store?.user;
    const id =
      u?.id ??
      u?.user_id ??
      u?.uid ??
      (typeof window !== "undefined" ? localStorage.getItem("user_id") : null);
    return id ? Number(id) : null;
  };

  const studentByStudentGroupId = useMemo(() => {
    const m = new Map();
    (students || []).forEach((st) => {
      if (st?.student_group_id != null) {
        m.set(String(st.student_group_id), st);
      }
    });
    return m;
  }, [students]);

  const student = useMemo(() => {
    if (!submission) return null;
    return studentByStudentGroupId.get(String(submission.student_id)) || null;
  }, [submission, studentByStudentGroupId]);

  useEffect(() => {
    const load = async () => {
      setErr(null);
      setLoading(true);

      try {
        if (!backend) throw new Error("VITE_BACKEND_URL no está definido.");
        if (!todoId) throw new Error("Falta todoId en la URL.");
        if (!submissionId) throw new Error("Falta submissionId en la URL.");

        const todoResp = await fetch(`${backend}/todos/${todoId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const todoParsed = await safeReadJsonOrTextError(todoResp);

        if (!todoResp.ok) {
          const msg =
            todoParsed.json?.msg || todoParsed.text || "Error al cargar tarea";
          throw new Error(msg);
        }
        const todoData = todoParsed.json;
        setTodo(todoData);

        const subResp = await fetch(`${backend}/submission/${submissionId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const subParsed = await safeReadJsonOrTextError(subResp);

        if (!subResp.ok) {
          const msg =
            subParsed.json?.msg || subParsed.text || "Error al cargar entrega";
          throw new Error(msg);
        }

        setSubmission(subParsed.json?.submission || null);

        if (todoData?.group_id) {
          const studentsResp = await fetch(
            `${backend}/groups/${todoData.group_id}/students`,
            { headers: token ? { Authorization: `Bearer ${token}` } : {} }
          );
          const studentsParsed = await safeReadJsonOrTextError(studentsResp);

          if (!studentsResp.ok) {
            const msg =
              studentsParsed.json?.msg ||
              studentsParsed.text ||
              "Error al cargar alumnos del grupo";
            throw new Error(msg);
          }

          setStudents(
            Array.isArray(studentsParsed.json) ? studentsParsed.json : []
          );
        } else {
          setStudents([]);
        }

        const stResp = await fetch(
          `${backend}/submissions/${submissionId}/status`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
        const stParsed = await safeReadJsonOrTextError(stResp);

        if (!stResp.ok) {
          setStatus(null);
          setStateValue("pendiente");
          setFeedback("");
        } else {
          setStatus(stParsed.json);
          setStateValue(mapStateToUI(stParsed.json?.state));
          setFeedback(stParsed.json?.feedback || "");
        }
      } catch (e) {
        setErr(e.message || "Error inesperado");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [backend, todoId, submissionId, token]);

  const saveReview = async () => {
    setErr(null);
 setOkMsg(null);
    try {
      if (!backend) throw new Error("VITE_BACKEND_URL no está definido.");
      if (!submissionId) throw new Error("Falta submissionId.");

      const teacherId = getTeacherId();
      if (!teacherId) throw new Error("No se encontró el ID del docente.");

      const payload = {
        submission_id: Number(submissionId),
        teacher_id: teacherId,
        state: mapStateToBackend(stateValue),
        feedback: feedback,
      };

      if (status?.id) {
        const putResp = await fetch(`${backend}/statuses/${status.id}`, {
          method: "PUT",
          headers: authHeaders,
          body: JSON.stringify(payload),
        });

        const putParsed = await safeReadJsonOrTextError(putResp);

        if (!putResp.ok) {
          const msg =
            putParsed.json?.msg ||
            putParsed.text ||
            `Error actualizando calificación (${putResp.status})`;
          throw new Error(msg);
        }
      } else {
        const postResp = await fetch(`${backend}/statuses`, {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify(payload),
        });

        const postParsed = await safeReadJsonOrTextError(postResp);

        if (!postResp.ok) {
          const msg =
            postParsed.json?.msg ||
            postParsed.text ||
            `Error creando calificación (${postResp.status})`;
          throw new Error(msg);
        }
      }
       
      const stResp = await fetch(
        `${backend}/submissions/${submissionId}/status`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      const stParsed = await safeReadJsonOrTextError(stResp);

      if (stResp.ok) {
        setStatus(stParsed.json);
        setStateValue(mapStateToUI(stParsed.json?.state));
        setFeedback(stParsed.json?.feedback || "");
      }

      // alert("Calificación guardada ✅");
      // setShowDeleteModal(true);
      setOkMsg("Calificación guardada exitosamente.");
      
    } catch (e) {
      setErr(e.message || "Error guardando calificación");
    }

    setTimeout(() => {
      navigate("/homeTeacher/todos");
    }, 1000);
  };

  if (loading) return <div className="container mt-5">Cargando...</div>;
  if (err) return <div className="container mt-5 alert alert-danger">{err}</div>;
  if (!todo) return <div className="container mt-5">No se encontró la tarea.</div>;

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Revisión de entrega</h2>

      <div className="card mb-3">
        <div className="card-body">
          <h5 className="card-title">Tarea</h5>
          <p className="mb-1">
            <b>Título:</b> {todo.title || "—"}
          </p>
          <p className="mb-1">
            <b>Vencimiento:</b> {todo.due_date || "—"}
          </p>
          <p className="mb-0">
            <b>Descripción:</b> {todo.description || "—"}
          </p>
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-body">
          <h5 className="card-title">Alumno</h5>
          <p className="mb-1">
            <b>Nombre:</b> {student?.name || "—"}
          </p>
          <p className="mb-0">
            <b>Email:</b> {student?.email || "—"}
          </p>
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-body">
          <h5 className="card-title">Entrega</h5>
          <p className="mb-2">
            <b>Descripción:</b> {submission?.description || "—"}
          </p>
          <p className="mb-0">
            <b>Link:</b>{" "}
            {submission?.response_url ? (
              <a
  href={submission.response_url}
  target="_blank"
  rel="noreferrer"
  style={{  color: "#49BBBD", border: "none" }}
>
  <span> Ver archivo </span>
</a>
            ) : (
              "—"
            )}
          </p>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Corrección</h5>

          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Estado</label>
              <select
                className="form-select"
                value={stateValue}
                onChange={(e) => setStateValue(e.target.value)}
              >
                <option value="pendiente">Pendiente</option>
                <option value="aprobado">Aprobado</option>
                <option value="rechazado">Rechazado</option>
              </select>
              <div className="form-text">
                {status?.id ? "Calificación existente" : "Sin calificar aún"}
              </div>
            </div>

            <div className="col-md-8">
              <label className="form-label">Devolución</label>
              <textarea
                className="form-control"
                rows={4}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </div>
          </div>

          <div className="d-flex gap-2 mt-3">
            <button
  className="btn"
  style={{ backgroundColor: "#5B72EE", color: "#fff", border: "none" }}
  onClick={saveReview}
>
  Guardar calificación
</button>
            <button
              className="btn btn-outline-secondary"
              onClick={() => {
                setStateValue(status ? mapStateToUI(status.state) : "pendiente");
                setFeedback(status?.feedback || "");
              }}
            >
              Revertir cambios
            </button>
          </div>
        </div>
      </div>

      <div className="mb-5">
        {okMsg && (
  <div className="alert alert-success" role="alert">
    {okMsg}
  </div>
)}
        <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
          Volver
        </button>
      </div>

       {/* {showDeleteModal && (
                <>
                    <div className="modal fade show d-block" tabIndex="-1">
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content border-0 shadow-lg rounded-4">

                                <div className="modal-header border-0 justify-content-center">
                                    <h5 className="modal-title text-success text-center fw-bold">
                                         Tarea calificada ✅
                                    </h5>
                                    </div> 
                                    </div> 
                                    </div> 
                                    </div> 
                                  
                                    </> )} */}

    </div>

   
  );
};
