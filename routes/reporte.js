var express = require('express');
var SEED = require('../config/config').SEED;

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Reporte = require('../models/reporte');

//===========================
// Obtener todos los Reportes
//===========================

app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Reporte.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'usuario email')
        .populate('empresa')
        .exec(
            (err, reporte) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando reportes',
                        errors: err
                    });
                }

                Reporte.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        reportes: reportes,
                        total: conteo
                    });
                })


            })

});




//=============================
// Actualizar un reporte
//=============================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Reporte.findById(id, (err, reporte) => {


        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar reporte',
                errors: err
            });
        }

        if (!reporte) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El reporte con el id ' + id + ' no existe',
                errors: { message: 'no existe un reporte con ese ID' }
            });
        }

        reporte.nombre = body.nombre;
        reporte.descripcion = body.descripcion;
        reporte.usuario = req.usuario._id;
        reporte.empresa = body.proyecto;

        reporte.save((err, reporteGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar reporte',
                    errors: err
                });
            }


            res.status(200).json({
                ok: true,
                reporte: reporteGuardado
            });

        });

    });

});




//=============================
// Creacion de un nuevo reporte
//=============================

app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var reporte = new Reporte({
        nombre: body.nombre,
        descripcion: body.descripcion,
        usuario: req.usuario._id,
        proyecto: body.proyecto
    });

    reporte.save((err, reporteGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error crear reporte',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            reporte: reporteGuardado
        });

    });



});

//=============================
// Borrar un reporte por el id
//=============================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    Reporte.findByIdAndDelete(id, (err, reporteBorrado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al borrar reporte',
                errors: err
            });
        }

        if (!reporteBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un reporte con ese ID',
                errors: { message: 'No existe un reporte con ese ID' }
            });
        }

        res.status(200).json({
            ok: true,
            reporte: reporteBorrado
        });


    });

});
module.exports = app;