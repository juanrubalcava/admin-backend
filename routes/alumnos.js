var express = require('express');
var fs = require('fs');

var SEED = require('../config/config').SEED;

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Alumno = require('../models/alumno');


app.get('/', mdAutenticacion.verificaToken, (req, res, next) => {
    // var desde = req.query.desde || 0;
    // desde = Number(desde);

    Alumno.find({})
        // .skip(desde)
        // // .limit(5)
        // .populate('usuario', 'nombre email')
        .exec(
            (err, alumnos) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando alumnos',
                        errors: err
                    });
                }

                Alumno.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        alumnos: alumnos,
                        total: conteo
                    });
                });
            });
});

app.get('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Alumno.findById(id, (err, alumno) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar alumno',
                errors: err
            });
        }

        if (!alumno) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El alumno con el id ' + id + ' no existe',
                errors: {
                    message: 'No existe un alumno con ese ID'
                }
            });
        }

        res.status(200).json({
            ok: true,
            alumno: alumno
        });
    });
});

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Alumno.findById(id, (err, alumno) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar alumno',
                errors: err
            });
        }

        if (!alumno) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El alumno con el id ' + id + ' no existe',
                errors: {
                    message: 'No existe un alumno con ese ID'
                }
            });
        }

        alumno.nombre = body.nombre;
        alumno.email = body.email;
        alumno.telefono = body.telefono;
        alumno.usuario = req.usuario._id;

        alumno.save((err, alumnoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar alumno',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                alumno: alumnoGuardado
            });
        });
    });
});

app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;
    var alumno = new Alumno({
        nombre: body.nombre,
        email: body.email,
        telefono: body.telefono,
        usuario: req.usuario._id
    });

    alumno.save((err, alumnoGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear alumno',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            alumno: alumnoGuardado
        });
    });
});

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Alumno.findByIdAndDelete(id, (err, alumnoBorrado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al borrar alumno',
                errors: err
            });
        }

        if (!alumnoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un alumno con ese ID',
                errors: {
                    message: 'No existe un alumno con ese ID'
                }
            });
        }

        res.status(200).json({
            ok: true,
            alumno: alumnoBorrado
        });
    });
});

module.exports = app;