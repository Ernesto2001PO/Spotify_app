const db = require("../models/")
const zod = require("zod");
const { upload, getRelativePath } = require("../config/multer-config");


exports.getArtistas = async (req, res) => {
    try {
        const artistas = await db.Artista.findAll();
        console.log("Artistas encontrados:", { artistas });

        res.send(artistas);
    } catch (error) {
        console.error("Error al obtener los artistas:", error);
        res.status(500).json({
            message: "Error al obtener los artistas",
            error: error.message,
        });
    }
}

exports.getArtistaByGenero = async (req, res) => {
    const { id_genero } = req.params;
    try {
        const artistas = await db.Artista.findAll({
            where: {
                id_genero: parseInt(id_genero),
            },
        });
        console.log("Valor de id_genero:", id_genero);
        console.log("Artistas encontrados por género:", { artistas });
        res.send(artistas);
    } catch (error) {
        console.error("Error al obtener los artistas por género:", error);
        res.status(500).json({
            message: "Error al obtener los artistas por género",
            error: error.message,
        });
    }
}
exports.getArtistById = async (req, res) => {
    const id = req.params.id;
    try {
        const artista = await db.Artista.findByPk(id);
        if (!artista) {
            return res.status(404).json({
                message: "Artista no encontrado",
            });
        }
        console.log("Artista encontrado:", { artista });

        res.send(artista);
    } catch (error) {
        console.error("Error al obtener el artista:", error);
        res.status(500).json({
            message: "Error al obtener el artista",
            error: error.message,
        });
    }
}

exports.createArtista = [
    upload.single("imagen"),
    async (req, res) => {
        const { nombre, id_genero } = req.body;
        try {
            console.log("Inicio de createArtista");

            const artistaValidate = zod.object({
                nombre: zod.string().min(1, "El nombre es requerido"),
                id_genero: zod.string().min("El id del artista debe ser un número positivo"),
            });

            const result = artistaValidate.safeParse({ nombre, id_genero });
            if (!result.success) {
                return res.status(400).json({
                    message: "Error de validación",
                    errors: result.error.errors,
                });
            }

            console.log("Validación exitosa");


            const genero = await db.Genero.findByPk(id_genero);
            if (!genero) {
                return res.status(404).json({
                    message: "Genero no encontrado",
                });
            }

            const existingArtista = await db.Artista.findOne({
                where: {
                    nombre,
                    id_genero,
                },
            });
            console.log("Artista existente:", { existingArtista });
            if (existingArtista) {
                return res.status(400).json({
                    message: "El artista ya existe",
                });
            }

            const imagen = req.file ? getRelativePath(req.file.path) : null;



            const newArtista = await db.Artista.create({
                nombre,
                imagen: imagen,
                id_genero: parseInt(id_genero),
            });
            console.log("Artista creado:", { newArtista });
            res.status(201).json(newArtista);
        } catch (error) {
            console.error("Error al crear el artista:", error);
            if (req.file) {
                const imagen = require("fs");
                imagen.unlink(req.file.path, (err) => {
                    if (err) {
                        console.error("Error al eliminar la imagen:", err);
                    }
                });
            }
            return res.status(500).json({
                message: "Error al crear el artista",
                error: error.message,
            });
        }

    }
]


exports.updateArtista = [
    upload.single("imagen"), // Middleware para procesar el archivo con el campo "imagen"
    async (req, res) => {
        const id = req.params.id;
        const { nombre, id_genero } = req.body;
        try {
            const artistaValidate = zod.object({
                nombre: zod.string().min(1, "El nombre es requerido"),
                id_genero: zod.string().min("El id del artista debe ser un número positivo"),
            });
            const result = artistaValidate.safeParse({ nombre, id_genero });
            if (!result.success) {
                return res.status(400).json({
                    message: "Error de validación",
                    errors: result.error.errors,
                });
            }
            const genero = await db.Genero.findByPk(id_genero);
            if (!genero) {
                return res.status(404).json({
                    message: "Artista no encontrado",
                });
            }

            const existingArtista = await db.Artista.findByPk(id);
            if (!existingArtista) {
                return res.status(404).json({
                    message: "Artista no encontrado",
                });
            }

            const nuevaImagen = req.file ? getRelativePath(req.file.path) : null;

            await existingArtista.update({
                nombre,
                imagen: nuevaImagen,
                id_genero: parseInt(id_genero),
            });
            console.log("Artista actualizado:", { existingArtista });
            res.status(200).json(existingArtista);
        } catch (error) {
            console.error("Error al actualizar el artista:", error);
            if (req.file) {
                // Eliminar la imagen del servidor si hubo un error
                const imagen = require("fs");
                imagen.unlink(req.file.path, (err) => {
                    if (err) {
                        console.error("Error al eliminar la imagen:", err);
                    }
                }
                )
                res.status(500).json({
                    message: "Error al actualizar el artista",
                    error: error.message,
                });
            }
        }
    }
]


exports.patchArtista = async (req, res) => {
    if (!req.body) {
        return { errors: { message: "Petición inválida" } };
    }
    const { id } = req.params;
    const artista = await db.Artista.findByPk(id);
    if (!artista) {
        return res.status(404).send({ message: 'Persona no encontrada' });
    }
    const { nombre, imagen, id_genero } = req.body;
    if (nombre) {
        artista.nombre = nombre;
    }
    if (imagen) {
        artista.imagen = imagen;
    }
    if (id_genero) {
        artista.id_genero = id_genero;
    }

    const artistaSaved = await artista.save();
    if (!artistaSaved) {
        res.status(500).send({ message: "Error al editar la persona" });
        return;
    }
    res.send(artistaSaved);
}


exports.deleteArtista = async (req, res) => {
    const id = req.params.id;
    try {
        const artista = await db.Artista.findByPk(id);
        if (!artista) {
            return res.status(404).json({
                message: "Artista no encontrado",
            });
        }
        await artista.destroy();
        console.log("Artista eliminado:", { artista });
        res.status(200).json({
            message: "Artista eliminado",
        });
    } catch (error) {
        console.error("Error al eliminar el artista:", error);
        res.status(500).json({
            message: "Error al eliminar el artista",
            error: error.message,
        });
    }
}










