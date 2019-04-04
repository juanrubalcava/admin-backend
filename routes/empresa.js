var express = require('express');
var fs = require('fs');

var SEED = require('../config/config').SEED;

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Empresa = require('../models/empresa');

//===========================
// Obtener todos las empresas
//===========================

app.get('/', mdAutenticacion.verificaToken, (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Empresa.find({})
        .skip(desde)
        // .limit(5)
        .populate('usuario', 'nombre email')
        .exec(
            (err, empresas) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando empresas',
                        errors: err
                    });
                }

                Empresa.count({}, (err, conteo) => {

                    res.status(200).json({
                        ok: true,
                        empresas: empresas,
                        total: conteo
                    });

                })


            })

});




//=============================
// Actualizar una empresa
//=============================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Empresa.findById(id, (err, empresa) => {


        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar empresa',
                errors: err
            });
        }

        if (!empresa) {
            return res.status(400).json({
                ok: false,
                mensaje: 'la empresa con el id ' + id + ' no existe',
                errors: { message: 'no existe una empresa con ese ID' }
            });
        }

        empresa.nombre = body.nombre;
        empresa.usuario = req.usuario._id;

        empresa.save((err, empresaGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar empresa',
                    errors: err
                });
            }


            res.status(200).json({
                ok: true,
                empresa: empresaGuardado
            });

        });

    });

});




//=============================
// Creacion de una nueva empresa
//=============================

app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var empresa = new Empresa({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    empresa.save((err, empresaGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear empresa',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            empresa: empresaGuardado
        });

    });



});

//=============================
// Borrar una empresa por el id
//=============================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    Empresa.findByIdAndDelete(id, (err, empresaBorrado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al borrar empresa',
                errors: err
            });
        }

        if (!empresaBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe una empresa con ese ID',
                errors: { message: 'No existe una empresa con ese ID' }
            });
        }

        // Si existe elimina la imagen
        var pathViejo = './uploads/empresas/' + empresaBorrado.img;
        if (fs.existsSync(pathViejo)) {
            fs.unlinkSync(pathViejo);
        }

        res.status(200).json({
            ok: true,
            empresa: empresaBorrado
        });


    });

});
module.exports = app;