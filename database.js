import postgres from "postgres";
import dotenv from "dotenv";
dotenv.config();

function conectar(){
    return postgres({
		host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
	})
}


export function leerRutinas(){
	return new Promise( async (ok,ko) => {
		let conexion = conectar();
			try{
				let contenido = await conexion `SELECT * FROM rutinas ORDER BY nombre ASC `;
				ok(contenido)
			}catch(error){
				console.log(error)
				ko({error: "error en la base de datos"})
			}finally{
				conexion.end()
			}
	});
}
 

export function crearRutina(nombre, descripcion, ejercicios, status){
	return new Promise( async (ok,ko) => {
		let conexion = conectar();
			try{
				let respuesta = await conexion `INSERT INTO rutinas (nombre, descripcion, ejercicios, status) VALUES (${nombre}, ${descripcion}, ${ejercicios}, ${status}) RETURNING id;`;
				ok(respuesta);
			}catch(error){
				console.log(error)
				ko({error: "error en la base de datos"})
			}finally{
				conexion.end()
			}
	});
}

export function deleteRutina(id){
	return new Promise( async (ok,ko) => {
		let conexion = conectar();
			try{
				let respuesta = await conexion `DELETE FROM rutinas WHERE id = ${id} RETURNING *`;
				ok(respuesta);
			}catch(error){
				console.log(error)
				ko({error: "error en la base de datos"})
			}finally{
				conexion.end()
			}
	});
}
//deleteRutina es un .delete que se encarga de eliminar una rutina de ejercicios, el valor es el id de la 

export async function updateRutina(id, nombre, descripcion, ejercicios) {
    return new Promise(async (ok, ko) => {
      let conexion = conectar(); // Conectar a la base de datos
      console.log("Conexión exitosa:", conexion);
  
      try {
        // Ejecutar la consulta para actualizar la rutina
        let respuesta = await conexion `UPDATE rutinas SET nombre = ${nombre}, descripcion = ${descripcion}, ejercicios = ${ejercicios} WHERE id = ${id} RETURNING *`;
        console.log("Respuesta de la base de datos:", respuesta);
        if (respuesta.length > 0) {
            ok({ success: true, data: respuesta[0] });
          } else {
            ok({ success: false, error: "No se encontró la rutina a actualizar" });
          }
        }catch(error){
            console.log(error)
            ko({error: "error en la base de datos"})
        }finally{
            conexion.end()
        }  
    });
}
/*
export async function updateRutina(id, nombre, descripcion, ejercicios) {
    const conexion = conectar(); // Conectar a la base de datos
    console.log("Conexión exitosa:", conexion);
  
    try {
      // Ejecutar la consulta para actualizar la rutina
      const respuesta = await conexion.query(
        `UPDATE rutinas
         SET nombre = $1, descripcion = $2, ejercicios = $3
         WHERE id = $4
         RETURNING *`,
        [nombre, descripcion, JSON.stringify(ejercicios), id] // Valores de la consulta
      );
  
      // Validar si se encontraron filas
      if (respuesta.rows.length > 0) {
        return { success: true, data: respuesta.rows[0] }; // Retornar los datos actualizados
      } else {
        return { success: false, error: "No se encontró la rutina a actualizar" };
      }
    } catch (error) {
      console.error("Error en updateRutina:", error);
      return { success: false, error: "Error en la base de datos" }; // Manejar el error
    } finally {
      conexion.end(); // Cerrar la conexión
    }
  }
*/  

  
//updateRutina es un .put que se encarga de modificar una rutina de ejercicios, el primer valor es el id de la rutina, el segundo valor es el nombre de la rutina, el tercer valor es la descripcion de la rutina

export function editarStatus(id, status){
    return new Promise( async (ok,ko) => {
        let conexion = conectar();
            try{
                let respuesta = await conexion `UPDATE rutinas SET status = ${status} WHERE id = ${id} RETURNING *`;
                ok(respuesta);
            }catch(error){
                console.log(error)
                ko({error: "error en la base de datos"})
            }finally{
                conexion.end()
            }
    });
}
//Editar el status de la rutina.
