import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { RandomImgTarea } from "../components/RandomImgTarea";

export const TodoViewStudent = () => {
  const { store, dispatch } = useGlobalReducer();

  const [err, setErr] = useState(null);
  const [statusMap, setStatusMap] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  const todosPerPage = 6;

  useEffect(() => {
    getTodos();
  }, []);

  const getTodos = async () => {
    setErr(null);
    try {
      const backend = import.meta.env.VITE_BACKEND_URL;

      const resp = await fetch(`${backend}/todos`);

      const data = await resp.json().catch(() => ([]));
      if (!resp.ok) throw new Error("Error al cargar tareas");

      dispatch({ type: "GET_TODOS_SUCCESS", payload: data });
    } catch (error) {
      setErr(error.message);
    }
  };

  const toggleStatus = (id) => {
    setStatusMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const sortedTodos = [...(store.todos || [])].sort((a, b) => b.id - a.id);

  const totalPages = Math.ceil(sortedTodos.length / todosPerPage);
  const indexOfLast = currentPage * todosPerPage;
  const indexOfFirst = indexOfLast - todosPerPage;
  const currentTodos = sortedTodos.slice(indexOfFirst, indexOfLast);

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  return (
    <div className="container mt-4 mt-md-5">
      {/* Header responsive */}
      <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-2 mb-4">
        <h1 className="m-0">
          Tus tareas,{" "}
          <span className="text-primary">{store.user?.name || "Estudiante"}</span>
        </h1>

        <small className="text-muted">
          Mostrando {currentTodos.length} de {sortedTodos.length}
        </small>
      </div>

      {err && <div className="alert alert-danger">{err}</div>}

      <div className="row g-4">
        {currentTodos?.map((todo) => (
          <div className="col-12 col-sm-6 col-lg-4" key={todo.id}>
            <div className="card h-100 shadow-sm">
              <div className="todo-img-wrapper">
                <RandomImgTarea seed={todo.id} className="card-img-top" alt="tarea" />
              </div>

              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{todo.title}</h5>

                <div className="mt-auto d-flex flex-column flex-sm-row gap-2">
                  <Link to={`/todos/${todo.id}`} className="btn btn-primary w-100">
                    Revisar tarea
                  </Link>

                  <button
                    className={`btn w-100 ${
                      statusMap[todo.id] ? "btn-success" : "btn-outline-secondary"
                    }`}
                    onClick={() => toggleStatus(todo.id)}
                  >
                    {statusMap[todo.id] ? "Completada" : "Pendiente"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {sortedTodos.length === 0 && !err && (
          <div className="col-12">
            <div className="alert alert-light border mb-0">
              No tienes tareas asignadas.
            </div>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4 mb-3">
          <div className="d-flex flex-wrap gap-2 justify-content-center">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`btn btn-sm ${page === currentPage ? "btn-dark" : "btn-outline-dark"}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
