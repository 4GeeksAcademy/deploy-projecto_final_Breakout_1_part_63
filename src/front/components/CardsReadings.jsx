import { Link } from "react-router-dom";
import lecturaslogo from "../assets/img/lecturaslogo.png";
import { RandomImgLecturas } from "./RandomImgLecturas"; 

export const CardsReadings = ({
    readings

}) => {
    return (
        <div className="row">
            {readings.map((reading) => (
                <div className="col-md-4 mb-4" key={reading.id}>
                    <div className="card h-100 shadow">

                       
                            {<RandomImgLecturas/>}
                        

                        <div className="card-body">

                            <h5 className="card-title">
                                {reading.title}
                            </h5>

                            <Link
                                to={`/reading/${reading.id}`}
                                className="btn btn-primary me-2"
                            >
                                Revisar lectura
                            </Link>

                            

                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
