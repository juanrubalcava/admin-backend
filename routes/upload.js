var express = require('express');

var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

var Proyecto = require('../models/empresa');
var Usuario = require('../models/usuario');

// Default options
app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // Tipos de coleccion

    var tiposValidos = ['empresas', 'usuarios'];

    if (tiposValidos.indexOf(tipo) < 0) {

        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de coleccion no es valida',
            errors: { message: 'Debe de seleccionar una coleccion valida' }

        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No selecciono una archivo',
            errors: { message: 'Debe de seleccionar una archivo' }

        });

    }

    // Obtener nombre del archivo

    var archivo = req.files.image;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // Extensiones permitidas

    var extensionesValidas = ['jpg', 'png', 'jpeg', 'pdf']

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extension no valida',
            errors: { message: 'Debe de agregar extensiones validas' + extensionesValidas.join(' , ') }

        });

    }


    // Nombre de archivo personalizado

    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;


    // Mover archivo tmp to a path

    var path = `./uploads/${ tipo }/${ nombreArchivo }`;

    archivo.mv(path, err => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err

            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);


    })


});

function subirPorTipo(tipo, id, nombreArchivo, res) {

    if (tipo === 'usuarios') {

        Usuario.findById(id, (err, usuario) => {

            if (!usuario) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Usuario no existe, porfavor intente de nuevo',
                    errors: { message: 'usuario no existe' }
                });
            }

            var pathViejo = './uploads/usuarios/' + usuario.img;

            // Si existe elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            usuario.img = nombreArchivo;

            usuario.save((err, usuarioActualizado) => {

                usuarioActualizado.password = '*******'
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuario: usuarioActualizado,

                });

            })

        });

    }

    if (tipo === 'empresas') {

        Proyecto.findById(id, (err, empresa) => {

            if (!empresa) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'empresa no existe, porfavor intente de nuevo',
                    errors: { message: 'empresa no existe' }
                });
            }

            var pathViejo = './uploads/empresas/' + empresa.img;

            // Si existe elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            empresa.img = nombreArchivo;

            empresa.save((err, empresaActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de Empresa actualizada',
                    empresa: empresaActualizado,
                    pathViejo: pathViejo
                });

            })

        });

    }
}

module.exports = app;