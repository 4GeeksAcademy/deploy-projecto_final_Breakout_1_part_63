import { useState, useEffect } from "react";
import { CardsReadings } from "../components/CardsReadings";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { Link } from "react-router-dom";



export const StudentViewReadings = () => {
   
    const { store, dispatch } = useGlobalReducer();


    const [readings, setReadings] = useState([]);
    const [err, setErr] = useState(null);
    

    const [currentPage, setCurrentPage] = useState(1);
    const readingsPerPage = 6;

    useEffect(() => {
        getStudentReadings();
    }, []);

    const getStudentReadings = async () => {
        setErr(null);

        try {
            const backend = import.meta.env.VITE_BACKEND_URL;
            const token = localStorage.getItem("token");

            if (!token) {
                throw new Error("Usuario no autenticado");
            }

            const resp = await fetch(`${backend}/student/readings`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await resp.json().catch(() => ([]));

            if (!resp.ok) {
                throw new Error("Error al cargar lecturas");
            }

            setReadings(data);

        } catch (error) {
            setErr(error.message);
        }
    };



    useEffect(() => {
            const fetchMe = async () => {
                try {
                    const backend = import.meta.env.VITE_BACKEND_URL;
                    const resp = await fetch(`${backend}/me`, {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    });
    
                    if (!resp.ok) throw new Error("Error obteniendo usuario");
    
                    const data = await resp.json();
    
                    dispatch({
                        type: "SET_CURRENT_USER",
                        payload: data,
                    });
                } catch (error) {
                    console.error("Error fetching current user:", error);
                }
            };
    
            fetchMe();
        }, [dispatch]);

    //logica paginacion

    const indexOfLast = currentPage * readingsPerPage;
    const indexOfFirst = indexOfLast - readingsPerPage;

    const sortedReadings = [...readings].sort(
        (a, b) => b.id - a.id
    );

    const currentReadings = sortedReadings.slice(
        indexOfFirst,
        indexOfLast
    );

    const totalPages = Math.ceil(
        sortedReadings.length / readingsPerPage
    );



    return (
        <div className="container mt-5">
           
        <Link to="/homeStudent">
								<button className="btn btn-light">
									←   Volver a Página Principal
								</button>
							</Link>
          

            <h2 className="display-5 fw-bold mb-4 ">
                                Tus lecturas,  <span className="text-primary">{store.user?.name || "Estudiante"}</span>
                            </h2>
        
                            

            {err && <div className="alert alert-danger">{err}</div>}

            <CardsReadings
                readings={currentReadings}
                
                
            />

            

        {/* paginación  */}
            <div className="d-flex justify-content-center mt-3 mb-3">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                        key={page}
                        className={`btn me-2 ${
                            page === currentPage
                                ? "btn-dark"
                                : "btn-outline-dark"
                        }`}
                        onClick={() => setCurrentPage(page)}
                    >
                        {page}
                    </button>
                ))}
            </div>

        </div>
    );
};
