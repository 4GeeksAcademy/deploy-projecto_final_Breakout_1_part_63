import React, { useEffect, useState } from "react";
import { TeacherTodoCard } from "../components/TeacherTodoCard";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { ReadingCards } from "../components/ReadingCards";
import { Link } from "react-router-dom";
import { TodoCardHomeTeacher } from "../components/TodoCardHomeTeacher.jsx";
import { ReadingCardHomeTeacher } from "../components/ReadingCardHomeTeacher.jsx";


export const HomeTeacher = () => {
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

  // useEffect(() => {
  //   const fetchTodos = async () => {
  //     const backend = import.meta.env.VITE_BACKEND_URL;
  //     const token = localStorage.getItem("token");


  //     try {
  //       if (!token) {
  //         console.warn("No hay token en localStorage");
  //         dispatch({ type: "SET_TODOS", payload: [] });
  //         return;
  //       }

  //       const resp = await fetch(`${backend}/teacher/todos`, {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       });

  //       const data = await resp.json();

  //       if (!resp.ok) {
  //         console.error("BACKEND ERROR:", resp.status, data);
  //         dispatch({ type: "SET_TODOS", payload: [] });
  //         return;
  //       }

  //       const todosArray =
  //         Array.isArray(data?.todos) ? data.todos :
  //           Array.isArray(data) ? data :
  //             Array.isArray(data?.results) ? data.results :
  //               [];

  //       dispatch({
  //         type: "SET_TODOS",
  //         payload: todosArray,
  //       });

  //     } catch (error) {
  //       console.error("Error fetching tasks:", error);
  //       dispatch({ type: "SET_TODOS", payload: [] });
  //     }
  //   };

  //   fetchTodos();
  // }, [dispatch]);

  // const fetchReadings = async () => {
  //   try {
  //     const backend = import.meta.env.VITE_BACKEND_URL;
  //     const resp = await fetch(`${backend}/readings`, {
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${localStorage.getItem("token")}`,
  //       },
  //     });



  //     const data = await resp.json();


  //     dispatch({
  //       type: "GET_READINGS_SUCCESS",
  //       payload: Array.isArray(data) ? data : [],
  //     });
  //   } catch (error) {
  //     console.error("Error fetching readings:", error);
  //   }
  // };

  // useEffect(() => {
  //   fetchReadings();
  // }, [dispatch]);

  //nuevo fetch traer todo por teacher by vicente

  useEffect(() => {
          getTeacherTodos();
      }, []);
  
      const getTeacherTodos = async () => {
          setErr(null);
  
          try {
              const backend = import.meta.env.VITE_BACKEND_URL;
              const token = localStorage.getItem("token");
  
              if (!token) {
                  throw new Error("Usuario no autenticado");
              }
  
              const resp = await fetch(`${backend}/teacher/todos/home`, {
                  headers: {
                      Authorization: `Bearer ${token}`
                  }
              });
  
              const data = await resp.json().catch(() => ([]));
  
              if (!resp.ok) {
                  throw new Error("Aún no tienes tareas creadas");
              }
  
              setTodos(data);
  
          } catch (error) {
              setErr(error.message);
          }
      };

  

  //traer lecturas de profesor 

  useEffect(() => {
        getTeacherReadings();
    }, []);

    const getTeacherReadings = async () => {
        setErr(null);

        try {
            const backend = import.meta.env.VITE_BACKEND_URL;
            const token = localStorage.getItem("token");

            if (!token) {
                throw new Error("Usuario no autenticado");
            }

            const resp = await fetch(`${backend}/teacher/readings`, {
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
                Bienvenido  <span className="text-primary">{store.user?.name || "Profesor"}</span>
              </h1>
              <p className="fs-5">
                Aquí podrás gestionar las tarea y lecturas de tus estudiantes de manera eficiente y organizada.
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
        <Link
          to="/homeTeacher/todos"
          className="text-decoration-none text-dark"
        >
          <h2 className="fw-bold mb-4">Tareas creadas</h2>
        </Link>

        {todos.length === 0 && <p>No hay tareas creadas</p>}

        <div className="d-flex gap-3 overflow-auto px-1 pb-2">
          {todos.map((todo) => (
            <TeacherTodoCard key={todo.id} todo={todo} />
          ))}
        </div>
      </div> */}

      {/* <div className="container mt-4">


          <Link
          to="/teacher/readings"
          className="text-decoration-none text-dark"
        >
          <h2 className="fw-bold mb-4">Lecturas creadas</h2>
        </Link>
        

        {store.readings.length === 0 && <p>No hay lecturas creadas</p>}

        <div className="d-flex gap-3 overflow-auto px-1 pb-2">
          {store.readings.map((reading) => (
            <ReadingCards key={reading.id} reading={reading} />
          ))}
        </div>
      </div> */}

      {/* nuevas cards todos */}
<div className="container mt-5">
    <div className="row">
      <div className="col-6">
    
    <h2 className="fw-bold mb-4">Tus tareas creadas <span className="fs-4 fw-lighter">(Vista Previa)</span></h2> 
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
      <p>No hay tareas creadas</p>
    )}
    
    <div className="row g-4">
      {currentTodos.map(todo => (
      <div key={todo.id} className="col-md-6 col-lg-3">
        <TodoCardHomeTeacher todo={todo} />
      </div>
      ))}
    </div>
     
    </div> 

{/* cards readings */}
      <div className="container mt-5">
        <div className="row">
          <div className="col-6">
        
        <h2 className="fw-bold mb-4">Lecturas Creadas <span className="fs-4 fw-lighter">(Vista Previa)</span></h2> 
        </div>
<div className="col-6 text-end">
          
<Link to="/teacher/readings">
                <button className="btn btn-outline-dark fs-6 p-1 mt-1">
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
              <ReadingCardHomeTeacher reading={reading} />
            </div>
          ))}
        </div>
       
      </div>

    </div>
  );
};
