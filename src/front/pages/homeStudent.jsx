import React, { useEffect, useState} from "react";
import { TodoCard } from "../components/todoCard";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { ReadingCards } from "../components/ReadingCards";
import { ReadingCardHomeStudent } from "../components/ReadingCardHomeStudent.jsx";
import { TodoCardHomeStudent } from "../components/TodoCardHomeStudent.jsx";
import { Link } from "react-router-dom";

export const HomeStudent = () => {
	const { store, dispatch } = useGlobalReducer();
	// const todos = store.todos || [];
	 const [readings, setReadings] = useState([]);
	 const [todos, setTodos] = useState([]);
	 const [err, setErr] = useState(null);
	 

	 const currentReadings = [...readings]
  .sort((a, b) => b.id - a.id) // más reciente primero
  .slice(0, 4);

  const currentTodos = [...todos]
  .sort((a, b) => b.id - a.id) // más reciente primero
  .slice(0, 4);

//fetch viejo para todos 
	// useEffect(() => {
	// 	const fetchTodos = async () => {
	// 		try {
	// 			const backend = import.meta.env.VITE_BACKEND_URL;
	// 			const resp = await fetch(`${backend}/todos`, {
	// 				headers: {
	// 					"Content-Type": "application/json",
	// 					Authorization: `Bearer ${localStorage.getItem("token")}`,
	// 				},
	// 			});

	// 			const data = await resp.json();

	// 			dispatch({
	// 				type: "SET_TODOS",
	// 				payload: data,
	// 			});

	// 		} catch (error) {
	// 			console.error("Error fetching tasks:", error);
	// 		}
	// 	};

	// 	fetchTodos();
	// }, [dispatch]);

	//nuevo fetch para todo con id by vicente

useEffect(() => {
        getStudentTodos();
    }, []);

    const getStudentTodos = async () => {
        setErr(null);

        try {
            const backend = import.meta.env.VITE_BACKEND_URL;
            const token = localStorage.getItem("token");

            if (!token) {
                throw new Error("Usuario no autenticado");
            }

            const resp = await fetch(`${backend}/student/todos/home`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await resp.json().catch(() => ([]));

            if (!resp.ok) {
                throw new Error("Aún no tienes tareas asignadas");
            }

            setTodos(data);

        } catch (error) {
            setErr(error.message);
        }
    };


// fetch readings con id by vicente
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
                throw new Error("Aún no tienes lecturas asignadas");
            }

            setReadings(data);

        } catch (error) {
            setErr(error.message);
        }
    };


	//traer nombre

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
	
	return (
		<div className="bg-light pb-5">
			<div className="g-color-bg hero-home text-white">
				<div className="container">
					<div className="row align-items-center">
						<div className="col-md-6">
							 <h1 className="display-5 fw-bold mb-4 g-color">
                                Bienvenido  <span className="text-primary">{store.user?.name || "Estudiante"}</span>
                            </h1>
							<p className="fs-5">
								Aquí podrás gestionar tus tareas, lecturas y calificaciones
								de forma simple y rápida.
							</p>
						</div>

						<div className="col-md-6 text-center my-3">
							<img
								src="https://fastly.picsum.photos/id/3/5000/3333.jpg?hmac=GDjZ2uNWE3V59PkdDaOzTOuV3tPWWxJSf4fNcxu4S2g"
								className="img-fluid rounded-5"
								alt="novedades"
							/>
						</div>
					</div>
				</div>
			</div>

			{/* <div className="container mt-5">
				<h2 className="fw-bold mb-4">Mis Tareas</h2>

				{todos.length === 0 && (
					<p>No hay tareas asignadas</p>
				)}

				<div className="d-flex gap-3 overflow-auto px-3 pb-3">
					{todos.map(todo => (
						<TodoCard key={todo.id} todo={todo} />
					))}
				</div>
			</div> */}

{/* cards todo nuevas */}
<div className="container mt-5">
		<div className="row">
		  <div className="col-6">
		
		<h2 className="fw-bold mb-4">Tus tareas asignadas <span className="fs-4 fw-lighter">(Vista Previa)</span></h2> 
		</div>
<div className="col-6 text-end">
		  
<Link to="/todoviewstudent">
				<button className="btn btn-outline-dark fs-6 p-1 mt-1 me-2">
				  Ver todas las tareas →
				</button>
				 </Link>
	 
	  </div>
	  
	  </div>
	 
		{currentTodos.length === 0 && (
		  <p>No hay tareas asignadas</p>
		)}
	  
		<div className="row g-4">
		  {currentTodos.map(todo => (
			<div key={todo.id} className="col-md-6 col-lg-3">
			  <TodoCardHomeStudent todo={todo} />
			</div>
		  ))}
		</div>
	   
	  </div> 

			

<div className="container mt-5">
		<div className="row">
		  <div className="col-6">
		
		<h2 className="fw-bold mb-4">Tus lecturas asignadas <span className="fs-4 fw-lighter">(Vista Previa)</span></h2> 
		</div>
<div className="col-6 text-end">
		  
<Link to="/readings/student">
				<button className="btn btn-outline-dark fs-6 p-1 mt-1 me-2">
				  Ver todas las lecturas →
				</button>
				 </Link>
	 
	  </div>
	  
	  </div>
	 
		{currentReadings.length === 0 && (
		  <p>No hay lecturas creadas</p>
		)}
	  
		<div className="row g-4">
		  {currentReadings.map(reading => (
			<div key={reading.id} className="col-md-6 col-lg-3">
			  <ReadingCardHomeStudent reading={reading} />
			</div>
		  ))}
		</div>
	   
	  </div> 


				
		</div>
	);
};