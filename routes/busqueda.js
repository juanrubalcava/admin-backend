var express = require('express');

var app = express();

var Proyecto = require('../models/empresa');

var Usuario = require('../models/usuario');

app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;

    var regex = new RegExp(busqueda, 'i');

    Promise.all([
            buscarEmpresas(busqueda, regex),
            buscarUsuarios(busqueda, regex)
        ])
        .then(respuestas => {

            res.status(200).json({
                ok: true,
                proyectos: respuestas[0],
                usuarios: respuestas[1],
            });

        })

});

function buscarEmpresas(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Proyecto.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .exec((err, empresa) => {


                if (err) {
                    reject('error al cargar empresas', err);
                } else {
                    resolve(empresa)
                }

            });

    });


}

function buscarUsuarios(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Usuario.find({}, 'nombre email role')
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuarios) => {

                if (err) {
                    reject('Error Al Cargar Usuarios', err);
                } else {
                    resolve(usuarios)
                }

            })

    });


}

module.exports = app;