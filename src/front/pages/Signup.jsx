import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export const Signup = () => {
  const { dispatch } = useGlobalReducer();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr(null);

    try {
      const backend = import.meta.env.VITE_BACKEND_URL;

      const resp = await fetch(`${backend}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await resp.json();

      if (!resp.ok) {
        throw new Error(data.msg || "Error al registrar");
      }

     
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("role", data.role);

     
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: {
          user: data.user,
          role: data.role,
        },
      });


      navigate("/homeStudent");

    } catch (error) {
      setErr(error.message);
    }
  };

  return (
    <div className="container-fluid vh-100">
      <div className="row h-100">

        <div className="col-md-6 d-none d-md-flex p-4">
          <div className="w-100 position-relative rounded-4 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1529070538774-1843cb3265df"
              alt="signup"
              className="w-100 h-100 object-fit-cover"
            />
            <div className="position-absolute bottom-0 start-0 p-4 text-white">
              <h2 className="fw-bold">BIENVENID@ A ACADEMICA</h2>
              <p>Crea tu cuenta para comenzar</p>
            </div>
          </div>
        </div>

        <div className="col-md-6 d-flex align-items-center justify-content-center">
          <div className="w-75" style={{ maxWidth: "420px" }}>

            <h3 className="text-center mb-4">REGÍSTRATE EN ACADEMICA</h3>

            <div className="d-flex justify-content-center mb-4">
              <div className="btn-group rounded-pill bg-light p-1">
                <Link to="/login">
                  <button className="btn btn-light rounded-pill px-4">
                    Ingresar
                  </button>
                </Link>
                <button className="btn btn-info rounded-pill px-4">
                  Registrarte
                </button>
              </div>
            </div>

            {err && <div className="alert alert-danger">{err}</div>}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control rounded-pill"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Nombre Completo</label>
                <input
                  type="text"
                  className="form-control rounded-pill"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label">Contraseña</label>
                <input
                  type="password"
                  className="form-control rounded-pill"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="text-center">
                <button className="btn btn-info rounded-pill px-5">
                  Registrate
                </button>
              </div>
            </form>

          </div>
        </div>

      </div>
    </div>
  );
};